/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import classnames from "classnames";
import { isLoaded } from "../../utils/source";
// import { isFirefox } from "devtools-environment";
import { features } from "../../utils/prefs";
import { getIndentation } from "../../utils/indentation";

import {
  getActiveSearch,
  getSelectedLocation,
  getSelectedSource,
  getHitCountForSource,
  getCoverageEnabled,
  getConditionalPanelLine,
  getSymbols,
  getEmptyLines
} from "../../selectors";

// Redux actions
import actions from "../../actions";

import Footer from "./Footer";
import SearchBar from "./SearchBar";
import HighlightLines from "./HighlightLines";
import Preview from "./Preview";
import Breakpoints from "./Breakpoints";
import HitMarker from "./HitMarker";
import CallSites from "./CallSites";
import DebugLine from "./DebugLine";
import HighlightLine from "./HighlightLine";
import GutterMenu from "./GutterMenu";
import EditorMenu from "./EditorMenu";
import ConditionalPanel from "./ConditionalPanel";

import {
  showSourceText,
  updateDocument,
  showLoading,
  showErrorMessage,
  shouldShowFooter,
  getEditor,
  clearEditor,
  getCursorLine,
  toSourceLine,
  getDocument,
  toEditorLine,
  hasDocument
} from "../../utils/monaco";

import { resizeToggleButton } from "../../utils/ui";

import "./Editor.css";
import "./Highlight.css";
import "./EmptyLines.css";

import {
  SourceEditor,
  EMPTY_LINES_DECORATION
} from "../../utils/monaco/source-editor";

import type { SymbolDeclarations } from "../../workers/parser";
import type { Location, Source } from "../../types";

const cssVars = {
  searchbarHeight: "var(--editor-searchbar-height)",
  secondSearchbarHeight: "var(--editor-second-searchbar-height)",
  footerHeight: "var(--editor-footer-height)"
};

export type Props = {
  hitCount: Object,
  selectedLocation: ?Location,
  selectedSource: ?Source,
  searchOn: boolean,
  coverageOn: boolean,
  horizontal: boolean,
  startPanelSize: number,
  endPanelSize: number,
  conditionalPanelLine: number,
  symbols: SymbolDeclarations,
  emptyLines: Object,

  // Actions
  openConditionalPanel: (?number) => void,
  closeConditionalPanel: void => void,
  setContextMenu: (string, any) => void,
  continueToHere: (?number) => void,
  toggleBreakpoint: (?number) => void,
  toggleBreakpointsAtLine: (?number) => void,
  addOrToggleDisabledBreakpoint: (?number) => void,
  jumpToMappedLocation: any => void,
  traverseResults: (boolean, Object) => void
};

type State = {
  editor: SourceEditor
};

class Editor extends PureComponent<Props, State> {
  $editorWrapper: ?HTMLDivElement;
  emptyLineDecorations: any[];
  /**
   * @todo, rebornix. Disposables.
   */
  keybindings: any[];

  constructor(props: Props) {
    super(props);

    this.state = {
      highlightedLineRange: null,
      editor: null
    };

    this.emptyLineDecorations = [];
    this.keybindings = [];
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.editor) {
      return;
    }

    resizeToggleButton(this.state.editor.monaco);
  }

  componentWillUpdate(nextProps) {
    this.setText(nextProps);
    this.setSize(nextProps);
    this.setEmptyLines(nextProps);
    this.scrollToLocation(nextProps);
  }

  setupEditor() {
    const editor = getEditor();

    const node = ReactDOM.findDOMNode(this);
    if (node instanceof HTMLElement) {
      editor.appendToLocalElement(node.querySelector(".editor-mount"));
    }

    editor.monaco.onMouseDown(e => {
      const data = e.target.detail;
      if (e.target.type < 2 || e.target.type > 4 || data.isAfterLines) {
        return;
      }

      // gutterClick

      if (e.event.leftButton) {
        if (
          e.target.type === 4 &&
          e.target.element.className.indexOf("folding") > 0
        ) {
          // folding
          return;
        }
        this.onGutterClick(e.target.position.lineNumber, e.event);
      } else if (e.event.rightButton) {
        this.onGutterContextMenu(
          e.target.position.lineNumber,
          e.event.browserEvent
        );
      }
      return false;
    });

    editor.monaco.onContextMenu(e => {
      this.openMenu(e);
    });

    /**
     * we don't need following actions anymore
     * `toggleFoldMarkerVisibility` as we set showFoldingControls to "mouseover"
     * `resizeBreakpointGutter` our breakpoint element width can be 100%
     * `codeMirrorWrapper.tabIndex/onKeyDown/onClick`, Monaco is focusable.
     */
    resizeToggleButton(editor.monaco);
    this.setState({ editor });
    return editor;
  }

  componentDidMount() {
    const { shortcuts } = this.context;

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key2");
    const searchAgainPrevKey = L10N.getStr(
      "sourceSearch.search.againPrev.key2"
    );

    shortcuts.on(L10N.getStr("toggleBreakpoint.key"), this.onToggleBreakpoint);
    shortcuts.on(
      L10N.getStr("toggleCondPanel.key"),
      this.onToggleConditionalPanel
    );
    shortcuts.on("Esc", this.onEscape);
    shortcuts.on(searchAgainPrevKey, this.onSearchAgain);
    shortcuts.on(searchAgainKey, this.onSearchAgain);
  }

  componentWillUnmount() {
    if (this.state.editor) {
      this.state.editor.destroy();
      this.setState({ editor: null });
    }

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

  componentDidUpdate(prevProps, prevState) {
    const { selectedSource } = this.props;
    // NOTE: when devtools are opened, the editor is not set when
    // the source loads so we need to wait until the editor is
    // set to update the text and size.
    if (!prevState.editor && selectedSource) {
      if (!this.state.editor) {
        const editor = this.setupEditor();
        updateDocument(editor, selectedSource);
      } else {
        this.setText(this.props);
        this.setSize(this.props);
      }
    }
  }

  getCurrentLine() {
    const { monaco } = this.state.editor;
    const { selectedSource } = this.props;
    if (!selectedSource) {
      return;
    }

    const line = getCursorLine(monaco);
    return toSourceLine(selectedSource.id, line);
  }

  onToggleBreakpoint = (key, e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { selectedSource, conditionalPanelLine } = this.props;

    if (!selectedSource) {
      return;
    }

    const line = this.getCurrentLine();

    if (e.shiftKey) {
      this.toggleConditionalPanel(line);
    } else if (!conditionalPanelLine) {
      this.props.toggleBreakpoint(line);
    } else {
      this.toggleConditionalPanel(line);
      this.props.toggleBreakpoint(line);
    }
  };

  onToggleConditionalPanel = (key, e: KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const line = this.getCurrentLine();
    this.toggleConditionalPanel(line);
  };

  /*
   * The default Esc command is overridden in the CodeMirror keymap to allow
   * the Esc keypress event to be catched by the toolbox and trigger the
   * split console. Restore it here, but preventDefault if and only if there
   * is a multiselection.
   */
  onEscape = (key, e: KeyboardEvent) => {
    if (!this.state.editor) {
      return;
    }

    // @todo, peng

    // const { codeMirror } = this.state.editor;
    // if (codeMirror.listSelections().length > 1) {
    //   codeMirror.execCommand("singleSelection");
    //   e.preventDefault();
    // }
  };

  onSearchAgain = (_, e: KeyboardEvent) => {
    this.props.traverseResults(e.shiftKey, this.state.editor);
  };

  openMenu(ev) {
    ev.event.browserEvent.stopPropagation();
    ev.event.browserEvent.preventDefault();

    const { setContextMenu } = this.props;
    return setContextMenu("Editor", ev);
  }

  onGutterClick = (line, ev) => {
    ev.stopPropagation();
    ev.preventDefault();

    const {
      selectedSource,
      conditionalPanelLine,
      closeConditionalPanel,
      addOrToggleDisabledBreakpoint,
      toggleBreakpointsAtLine,
      continueToHere
    } = this.props;

    if (conditionalPanelLine) {
      return closeConditionalPanel();
    }

    const sourceLine = toSourceLine(selectedSource.id, line);

    if (ev.metaKey) {
      return continueToHere(sourceLine);
    }

    if (ev.shiftKey) {
      return addOrToggleDisabledBreakpoint(sourceLine);
    }

    return toggleBreakpointsAtLine(sourceLine);
  };

  onGutterContextMenu = (line, event) => {
    event.stopPropagation();
    event.preventDefault();
    event.line = line;
    return this.props.setContextMenu("Gutter", event);
  };

  toggleConditionalPanel = line => {
    const {
      conditionalPanelLine,
      closeConditionalPanel,
      openConditionalPanel
    } = this.props;

    if (conditionalPanelLine) {
      return closeConditionalPanel();
    }

    return openConditionalPanel(line);
  };

  closeConditionalPanel = () => {
    return this.props.closeConditionalPanel();
  };

  shouldScrollToLocation(nextProps) {
    const { selectedLocation, selectedSource } = this.props;
    const { editor } = this.state;

    if (
      !editor ||
      !nextProps.selectedSource ||
      !nextProps.selectedLocation ||
      !nextProps.selectedLocation.line ||
      !isLoaded(nextProps.selectedSource)
    ) {
      return false;
    }

    const isFirstLoad =
      (!selectedSource || !isLoaded(selectedSource)) &&
      isLoaded(nextProps.selectedSource);
    const locationChanged = selectedLocation !== nextProps.selectedLocation;
    const symbolsChanged = nextProps.symbols != this.props.symbols;

    return isFirstLoad || locationChanged || symbolsChanged;
  }

  scrollToLocation(nextProps) {
    const { editor } = this.state;
    const { selectedLocation, selectedSource } = nextProps;

    if (selectedLocation && this.shouldScrollToLocation(nextProps)) {
      const line = selectedLocation.line;
      let column = selectedLocation.column ? selectedLocation.column : 0;

      if (selectedSource && hasDocument(selectedSource.id)) {
        const doc = getDocument(selectedSource.id);
        const lineText = doc.getLineContent(line);
        column = Math.max(column, getIndentation(lineText));
      }

      editor.monaco.revealPosition({ lineNumber: line, column: column });
    }
  }

  setSize(nextProps) {
    if (!this.state.editor) {
      return;
    }

    if (
      nextProps.startPanelSize !== this.props.startPanelSize ||
      nextProps.endPanelSize !== this.props.endPanelSize
    ) {
      this.state.editor.monaco.layout();
    }
  }

  setText(props) {
    const { selectedSource, symbols } = props;

    if (!this.state.editor) {
      return;
    }

    // check if we previously had a selected source
    if (!selectedSource) {
      return this.clearEditor();
    }

    // we are going to change text model, the decorations will be deleted.
    this.emptyLineDecorations = [];

    if (!isLoaded(selectedSource)) {
      return showLoading(this.state.editor);
    }

    if (selectedSource.error) {
      return this.showErrorMessage(selectedSource.error);
    }

    if (selectedSource) {
      return showSourceText(this.state.editor, selectedSource, symbols);
    }
  }

  setEmptyLines(nextProps) {
    const { selectedSource, emptyLines } = nextProps;
    const { editor } = this.state;

    if (!editor) {
      return;
    }

    if (!emptyLines) {
      return;
    }

    const newDecorations = emptyLines.map(emptyLine => {
      const line = toEditorLine(selectedSource.id, emptyLine);
      return {
        options: EMPTY_LINES_DECORATION,
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1
        }
      };
    });

    this.emptyLineDecorations = editor.monaco.deltaDecorations(
      this.emptyLineDecorations,
      newDecorations
    );
  }

  clearEditor() {
    const { editor } = this.state;
    if (!editor) {
      return;
    }

    clearEditor(editor);
  }

  showErrorMessage(msg) {
    const { editor } = this.state;
    if (!editor) {
      return;
    }

    showErrorMessage(editor, msg);
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
      !isLoaded(selectedSource) ||
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
    const { horizontal, selectedSource } = this.props;
    const { editor } = this.state;

    if (!editor || !selectedSource) {
      return null;
    }

    return (
      <div>
        <DebugLine editor={editor} />
        <HighlightLine editor={editor} />
        <Breakpoints editor={editor} />
        <Preview editor={editor} editorRef={this.$editorWrapper} />;
        <Footer editor={editor} horizontal={horizontal} />
        <HighlightLines editor={editor} />
        <EditorMenu editor={editor} />
        <GutterMenu editor={editor} />
        <ConditionalPanel editor={editor} />
        {features.columnBreakpoints ? <CallSites editor={editor} /> : null}
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
        ref={c => (this.$editorWrapper = c)}
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
  const sourceId = selectedSource ? selectedSource.id : "";

  return {
    selectedLocation: getSelectedLocation(state),
    selectedSource,
    searchOn: getActiveSearch(state) === "file",
    hitCount: getHitCountForSource(state, sourceId),
    coverageOn: getCoverageEnabled(state),
    conditionalPanelLine: getConditionalPanelLine(state),
    symbols: getSymbols(state, selectedSource),
    emptyLines: selectedSource ? getEmptyLines(state, selectedSource.id) : []
  };
};

export default connect(
  mapStateToProps,
  {
    openConditionalPanel: actions.openConditionalPanel,
    closeConditionalPanel: actions.closeConditionalPanel,
    setContextMenu: actions.setContextMenu,
    continueToHere: actions.continueToHere,
    toggleBreakpoint: actions.toggleBreakpoint,
    toggleBreakpointsAtLine: actions.toggleBreakpointsAtLine,
    addOrToggleDisabledBreakpoint: actions.addOrToggleDisabledBreakpoint,
    jumpToMappedLocation: actions.jumpToMappedLocation,
    traverseResults: actions.traverseResults
  }
)(Editor);
