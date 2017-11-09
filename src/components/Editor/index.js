/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import { debugGlobal } from "devtools-launchpad";
import { isLoaded } from "../../utils/source";
import { isFirefox } from "devtools-config";
import { SourceEditor } from "devtools-source-editor";

import {
  getActiveSearch,
  getSelectedLocation,
  getSelectedFrame,
  getSelectedSource,
  getHitCountForSource,
  getCoverageEnabled,
  getSourceMetaData,
  getConditionalPanelLine
} from "../../selectors";

// Redux actions
import { bindActionCreators } from "redux";
import actions from "../../actions";

import Footer from "./Footer";
import SearchBar from "./SearchBar";
import HighlightLines from "./HighlightLines";
import Preview from "./Preview";
import Breakpoints from "./Breakpoints";
import HitMarker from "./HitMarker";
import CallSites from "./CallSites";
import DebugLine from "./DebugLine";
import EmptyLines from "./EmptyLines";
import GutterMenu from "./GutterMenu";
import EditorMenu from "./EditorMenu";
import ConditionalPanel from "./ConditionalPanel";
import type { SourceMetaDataType } from "../../reducers/ast";

import {
  showSourceText,
  updateDocument,
  showLoading,
  shouldShowFooter,
  clearLineClass,
  createEditor,
  getCursorLine,
  resizeBreakpointGutter,
  toSourceLine,
  scrollToColumn,
  toEditorLine,
  resetLineNumberFormat,
  getSourceLocationFromMouseEvent
} from "../../utils/editor";

import { resizeToggleButton } from "../../utils/ui";

import "./Editor.css";
import "./Highlight.css";

const cssVars = {
  searchbarHeight: "var(--editor-searchbar-height)",
  secondSearchbarHeight: "var(--editor-second-searchbar-height)",
  footerHeight: "var(--editor-footer-height)"
};

type Props = {
  hitCount: Object,
  selectedLocation: Object,
  selectedSource: Object,
  searchOn: boolean,
  coverageOn: boolean,
  selectedFrame: Object,
  horizontal: boolean,
  startPanelSize: number,
  endPanelSize: number,
  conditionalPanelLine: number,
  sourceMetaData: SourceMetaDataType,

  // Actions
  openConditionalPanel: number => void,
  closeConditionalPanel: void => void,
  setContextMenu: (string, any) => void,
  continueToHere: number => void,
  toggleBreakpoint: number => void,
  addOrToggleDisabledBreakpoint: number => void,
  jumpToMappedLocation: any => void,
  traverseResults: (boolean, Object) => void
};

type State = {
  editor: SourceEditor
};

class Editor extends PureComponent<Props, State> {
  cbPanel: any;
  editor: SourceEditor;
  pendingJumpLocation: any;
  lastJumpLine: any;

  constructor() {
    super();

    this.pendingJumpLocation = null;
    this.lastJumpLine = null;

    this.state = {
      highlightedLineRange: null,
      editor: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.editor) {
      return;
    }

    resizeBreakpointGutter(this.state.editor.codeMirror);
    resizeToggleButton(this.state.editor.codeMirror);
  }

  setupEditor() {
    const editor = createEditor();

    // disables the default search shortcuts
    // @flow
    editor._initShortcuts = () => {};

    const node = ReactDOM.findDOMNode(this);
    if (node instanceof HTMLElement) {
      editor.appendToLocalElement(node.querySelector(".editor-mount"));
    }

    const { codeMirror } = editor;
    const codeMirrorWrapper = codeMirror.getWrapperElement();

    resizeBreakpointGutter(codeMirror);
    resizeToggleButton(codeMirror);

    debugGlobal("cm", codeMirror);

    codeMirror.on("gutterClick", this.onGutterClick);

    // Set code editor wrapper to be focusable
    codeMirrorWrapper.tabIndex = 0;
    codeMirrorWrapper.addEventListener("keydown", e => this.onKeyDown(e));
    codeMirrorWrapper.addEventListener("click", e => this.onClick(e));

    const toggleFoldMarkerVisibility = e => {
      if (node instanceof HTMLElement) {
        node
          .querySelectorAll(".CodeMirror-guttermarker-subtle")
          .forEach(elem => {
            elem.classList.toggle("visible");
          });
      }
    };

    const codeMirrorGutter = codeMirror.getGutterElement();
    codeMirrorGutter.addEventListener("mouseleave", toggleFoldMarkerVisibility);
    codeMirrorGutter.addEventListener("mouseenter", toggleFoldMarkerVisibility);

    if (!isFirefox()) {
      codeMirror.on("gutterContextMenu", (cm, line, eventName, event) =>
        this.onGutterContextMenu(event)
      );
      codeMirror.on("contextmenu", (cm, event) => this.openMenu(event));
    } else {
      codeMirrorWrapper.addEventListener("contextmenu", event =>
        this.openMenu(event)
      );
    }

    this.setState({ editor });
    return editor;
  }

  componentDidMount() {
    const editor = this.setupEditor();

    const { selectedSource, selectedLocation } = this.props;
    const { shortcuts } = this.context;

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key2");
    const searchAgainPrevKey = L10N.getStr(
      "sourceSearch.search.againPrev.key2"
    );

    shortcuts.on(L10N.getStr("toggleBreakpoint.key"), this.onToggleBreakpoint);
    shortcuts.on(
      L10N.getStr("toggleCondPanel.key"),
      this.toggleConditionalPanel
    );
    shortcuts.on("Esc", this.onEscape);
    shortcuts.on(searchAgainPrevKey, this.onSearchAgain);
    shortcuts.on(searchAgainKey, this.onSearchAgain);

    if (selectedLocation && !!selectedLocation.line) {
      this.pendingJumpLocation = selectedLocation;
    }

    const sourceId = selectedSource ? selectedSource.get("id") : undefined;
    updateDocument(editor, sourceId);
  }

  componentWillUnmount() {
    this.state.editor.destroy();
    this.setState({ editor: null });

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key2");
    const searchAgainPrevKey = L10N.getStr(
      "sourceSearch.search.againPrev.key2"
    );
    const shortcuts = this.context.shortcuts;
    shortcuts.off(L10N.getStr("toggleBreakpoint.key"));
    shortcuts.off(L10N.getStr("toggleCondPanel.key"));
    shortcuts.off(searchAgainPrevKey);
    shortcuts.off(searchAgainKey);
  }

  componentWillUpdate(nextProps) {
    this.setText(nextProps);
    this.setSize(nextProps);
  }

  componentDidUpdate(prevProps) {
    // This is in `componentDidUpdate` so helper functions can expect
    // `this.props` to be the current props. This lifecycle method is
    // responsible for updating the editor annotations.
    const { selectedLocation, selectedSource } = this.props;

    // If the location is different and a new line is requested,
    // update the pending jump line. Note that if jumping to a line in
    // a source where the text hasn't been loaded yet, we will set the
    // line here but not jump until rendering the actual source.

    if (prevProps.selectedLocation !== selectedLocation) {
      if (selectedLocation && selectedLocation.line != undefined) {
        this.pendingJumpLocation = selectedLocation;
      } else {
        this.pendingJumpLocation = null;
      }
    }

    // Only update and jump around in real source texts. This will
    // keep the jump state around until the real source text is
    // loaded.
    if (selectedSource && isLoaded(selectedSource.toJS())) {
      this.highlightLine();
    }
  }

  getCurrentLine() {
    const { codeMirror } = this.state.editor;
    const { selectedSource } = this.props;
    const line = getCursorLine(codeMirror);

    return toSourceLine(selectedSource.get("id"), line);
  }

  onToggleBreakpoint = (key, e) => {
    e.preventDefault();
    const { selectedSource } = this.props;

    if (!selectedSource) {
      return;
    }

    const line = this.getCurrentLine();

    if (e.shiftKey) {
      this.toggleConditionalPanel(line);
    } else {
      this.props.toggleBreakpoint(line);
    }
  };

  onKeyDown(e) {
    const { codeMirror } = this.state.editor;
    const { key, target } = e;
    const codeWrapper = codeMirror.getWrapperElement();
    const textArea = codeWrapper.querySelector("textArea");

    if (key === "Escape" && target == textArea) {
      e.stopPropagation();
      e.preventDefault();
      codeWrapper.focus();
    } else if (key === "Enter" && target == codeWrapper) {
      e.preventDefault();
      // Focus into editor's text area
      textArea.focus();
    }
  }

  /*
   * The default Esc command is overridden in the CodeMirror keymap to allow
   * the Esc keypress event to be catched by the toolbox and trigger the
   * split console. Restore it here, but preventDefault if and only if there
   * is a multiselection.
   */
  onEscape = (key, e) => {
    if (!this.state.editor) {
      return;
    }

    const { codeMirror } = this.state.editor;
    if (codeMirror.listSelections().length > 1) {
      codeMirror.execCommand("singleSelection");
      e.preventDefault();
    }
  };

  onSearchAgain = (_, e) => {
    this.props.traverseResults(e.shiftKey, this.state.editor);
  };

  openMenu(event) {
    event.stopPropagation();
    event.preventDefault();

    const { setContextMenu } = this.props;
    if (event.target.classList.contains("CodeMirror-linenumber")) {
      return setContextMenu("Gutter", event);
    }

    return setContextMenu("Editor", event);
  }

  onGutterClick = (cm, line, gutter, ev) => {
    const {
      selectedSource,
      conditionalPanelLine,
      closeConditionalPanel,
      addOrToggleDisabledBreakpoint,
      toggleBreakpoint,
      continueToHere
    } = this.props;

    // ignore right clicks in the gutter
    if (
      (ev.ctrlKey && ev.button === 0) ||
      ev.which === 3 ||
      (selectedSource && selectedSource.get("isBlackBoxed")) ||
      !selectedSource
    ) {
      return;
    }

    if (conditionalPanelLine) {
      return closeConditionalPanel();
    }

    if (gutter === "CodeMirror-foldgutter") {
      return;
    }

    const sourceLine = toSourceLine(selectedSource.get("id"), line);

    if (ev.altKey) {
      return continueToHere(sourceLine);
    }

    if (ev.shiftKey) {
      return addOrToggleDisabledBreakpoint(sourceLine);
    }
    return toggleBreakpoint(sourceLine);
  };

  onGutterContextMenu = event => {
    event.stopPropagation();
    event.preventDefault();
    return this.props.setContextMenu("Gutter", event);
  };

  onClick(e: MouseEvent) {
    const { selectedLocation, jumpToMappedLocation } = this.props;

    if (e.metaKey && e.altKey) {
      const sourceLocation = getSourceLocationFromMouseEvent(
        this.state.editor,
        selectedLocation,
        e
      );
      jumpToMappedLocation(sourceLocation);
    }
  }

  toggleConditionalPanel = line => {
    const {
      conditionalPanelLine,
      closeConditionalPanel,
      openConditionalPanel
    } = this.props;

    if (!line || isNaN(line)) {
      line = this.getCurrentLine();
    }

    if (conditionalPanelLine) {
      return closeConditionalPanel();
    }

    return openConditionalPanel(line);
  };

  closeConditionalPanel = () => {
    return this.props.closeConditionalPanel();
  };

  // If the location has changed and a specific line is requested,
  // move to that line and flash it.
  highlightLine() {
    const { selectedLocation, selectedFrame } = this.props;
    if (!selectedLocation) {
      return;
    }

    // Make sure to clean up after ourselves. Not only does this
    // cancel any existing animation, but it avoids it from
    // happening ever again (in case CodeMirror re-applies the
    // class, etc).
    if (this.lastJumpLine !== null) {
      clearLineClass(this.state.editor.codeMirror, "highlight-line");
    }

    let line = null;
    if (selectedLocation.line >= 0) {
      line = this.scrollToPosition();
    }

    // We only want to do the flashing animation if it's not a debug
    // line, which has it's own styling.
    // Also, if it the first time the debugger is being loaded, we don't want
    // to flash the previously saved selected line.
    if (
      line !== null &&
      this.lastJumpLine !== null &&
      (!selectedFrame || selectedFrame.location.line !== line)
    ) {
      this.state.editor.codeMirror.addLineClass(line, "line", "highlight-line");
    }

    this.lastJumpLine = line;
    this.pendingJumpLocation = null;
  }

  scrollToPosition() {
    const { sourceId, line, column } = this.props.selectedLocation;
    const editorLine = toEditorLine(sourceId, line);
    scrollToColumn(this.state.editor.codeMirror, editorLine, column);
    return editorLine;
  }

  setSize(nextProps) {
    if (!this.state.editor) {
      return;
    }

    if (
      nextProps.startPanelSize !== this.props.startPanelSize ||
      nextProps.endPanelSize !== this.props.endPanelSize
    ) {
      this.state.editor.codeMirror.setSize();
    }
  }

  setText(props) {
    const { selectedSource, sourceMetaData } = props;
    if (!this.state.editor) {
      return;
    }

    if (!selectedSource) {
      return this.showMessage("");
    }

    if (!isLoaded(selectedSource.toJS())) {
      return showLoading(this.state.editor);
    }

    if (selectedSource.get("error")) {
      return this.showMessage(selectedSource.get("error"));
    }

    if (selectedSource) {
      return showSourceText(
        this.state.editor,
        selectedSource.toJS(),
        sourceMetaData
      );
    }
  }

  showMessage(msg) {
    const { editor } = this.state;
    if (!editor) {
      return;
    }

    resetLineNumberFormat(editor);
  }

  getInlineEditorStyles() {
    const { selectedSource, horizontal, searchOn } = this.props;

    const subtractions = [];

    if (shouldShowFooter(selectedSource, horizontal)) {
      subtractions.push(cssVars.footerHeight);
    }

    if (searchOn) {
      subtractions.push(cssVars.searchbarHeight);
      subtractions.push(cssVars.secondSearchbarHeight);
    }

    return {
      height:
        subtractions.length === 0
          ? "100%"
          : `calc(100% - ${subtractions.join(" - ")})`
    };
  }

  renderHitCounts() {
    const { hitCount, selectedSource } = this.props;

    if (
      !selectedSource ||
      !isLoaded(selectedSource.toJS()) ||
      !hitCount ||
      !this.state.editor
    ) {
      return;
    }

    return hitCount
      .filter(marker => marker.get("count") > 0)
      .map(marker => (
        <HitMarker
          key={marker.get("line")}
          hitData={marker.toJS()}
          editor={this.state.editor.codeMirror}
        />
      ));
  }

  renderItems() {
    const { selectedSource, horizontal } = this.props;
    const { editor } = this.state;

    if (!editor || !selectedSource || !isLoaded(selectedSource.toJS())) {
      return null;
    }
    return (
      <div>
        <DebugLine editor={editor} />
        <EmptyLines editor={editor} />
        <Breakpoints editor={editor} />
        <CallSites editor={editor} />
        <Preview editor={editor} />;
        <Footer editor={editor} horizontal={horizontal} />
        <HighlightLines editor={editor} />
        <EditorMenu editor={editor} />
        <GutterMenu editor={editor} />
        <ConditionalPanel editor={editor} />
        {this.renderHitCounts()}
      </div>
    );
  }

  renderSearchBar() {
    const { editor } = this.state;

    if (!editor) {
      return null;
    }

    return <SearchBar editor={editor} />;
  }

  render() {
    const { coverageOn } = this.props;

    return (
      <div
        className={classnames("editor-wrapper", {
          "coverage-on": coverageOn
        })}
      >
        {this.renderSearchBar()}
        <div
          className="editor-mount devtools-monospace"
          style={this.getInlineEditorStyles()}
        />
        {this.renderItems()}
      </div>
    );
  }
}

Editor.contextTypes = {
  shortcuts: PropTypes.object
};

const mapStateToProps = state => {
  const selectedSource = getSelectedSource(state);
  const sourceId = selectedSource ? selectedSource.get("id") : "";
  return {
    selectedLocation: getSelectedLocation(state),
    selectedSource,
    searchOn: getActiveSearch(state) === "file",
    hitCount: getHitCountForSource(state, sourceId),
    selectedFrame: getSelectedFrame(state),
    coverageOn: getCoverageEnabled(state),
    conditionalPanelLine: getConditionalPanelLine(state),
    sourceMetaData: getSourceMetaData(state, sourceId)
  };
};

export default connect(mapStateToProps, dispatch =>
  bindActionCreators(actions, dispatch)
)(Editor);
