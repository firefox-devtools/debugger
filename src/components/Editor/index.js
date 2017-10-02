// @flow
import React, { PropTypes, PureComponent } from "react";
import ReactDOM from "react-dom";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import { isEnabled } from "devtools-config";
import GutterMenu from "./GutterMenu";
import EditorMenu from "./EditorMenu";
import { renderConditionalPanel } from "./ConditionalPanel";
import { debugGlobal } from "devtools-launchpad";
import { isLoaded } from "../../utils/source";
import { findFunctionText } from "../../utils/function";

import { isEmptyLineInSource } from "../../reducers/ast";

import {
  getActiveSearch,
  getSelectedLocation,
  getSelectedFrame,
  getSelectedSource,
  getHighlightedLineRange,
  getHitCountForSource,
  getCoverageEnabled,
  getLoadedObjects,
  getPause,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getVisibleBreakpoints,
  getInScopeLines,
  getConditionalBreakpointPanel,
  getSymbols
} from "../../selectors";

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

import {
  showSourceText,
  updateDocument,
  showLoading,
  shouldShowFooter,
  clearLineClass,
  createEditor,
  getCursorLine,
  resizeBreakpointGutter,
  traverseResults,
  lineAtHeight,
  toSourceLine,
  toEditorLine,
  resetLineNumberFormat,
  getSourceLocationFromMouseEvent
} from "../../utils/editor";

import { isFirefox } from "devtools-config";
import "./Editor.css";
import "./Highlight.css";

import { SourceEditor } from "devtools-source-editor";

const cssVars = {
  searchbarHeight: "var(--editor-searchbar-height)",
  secondSearchbarHeight: "var(--editor-second-searchbar-height)",
  footerHeight: "var(--editor-footer-height)"
};

class Editor extends PureComponent {
  cbPanel: any;
  editor: SourceEditor;
  pendingJumpLocation: any;
  lastJumpLine: any;
  state: Object;

  constructor() {
    super();

    this.cbPanel = null;
    this.pendingJumpLocation = null;
    this.lastJumpLine = null;

    this.state = {
      highlightedLineRange: null,
      editor: null
    };

    const self: any = this;
    self.closeConditionalPanel = this.closeConditionalPanel.bind(this);
    self.onEscape = this.onEscape.bind(this);
    self.onGutterClick = this.onGutterClick.bind(this);
    self.onGutterContextMenu = this.onGutterContextMenu.bind(this);
    self.onSearchAgain = this.onSearchAgain.bind(this);
    self.onToggleBreakpoint = this.onToggleBreakpoint.bind(this);
    self.toggleConditionalPanel = this.toggleConditionalPanel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.editor) {
      return;
    }

    this.setSize(nextProps);
    this.setText(nextProps);
    resizeBreakpointGutter(this.state.editor.codeMirror);
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

      codeMirror.on("contextmenu", (cm, event) => this.openMenu(event, editor));
    } else {
      codeMirrorWrapper.addEventListener("contextmenu", event =>
        this.openMenu(event, editor)
      );
    }

    this.setState({ editor });
    return editor;
  }

  componentDidMount() {
    this.cbPanel = null;
    const editor = this.setupEditor();

    const { selectedSource, selectedLocation } = this.props;
    const { shortcuts } = this.context;

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key2");
    const searchAgainPrevKey = L10N.getStr(
      "sourceSearch.search.againPrev.key2"
    );

    shortcuts.on(L10N.getStr("toggleBreakpoint.key"), this.onToggleBreakpoint);
    shortcuts.on(L10N.getStr("toggleCondPanel.key"), this.onToggleBreakpoint);
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
    if (selectedSource && selectedSource.has("text")) {
      this.highlightLine();
    }

    if (
      this.props.conditionalBreakpointPanel !== null &&
      this.cbPanel == null
    ) {
      this.toggleConditionalPanel(this.props.conditionalBreakpointPanel);
    }
  }

  onToggleBreakpoint(key, e) {
    e.preventDefault();
    const { codeMirror } = this.state.editor;
    const { selectedSource } = this.props;
    const line = getCursorLine(codeMirror);

    if (!selectedSource) {
      return;
    }

    const sourceLine = toSourceLine(selectedSource.get("id"), line);

    if (e.shiftKey) {
      this.toggleConditionalPanel(sourceLine);
    } else {
      this.props.toggleBreakpoint(sourceLine);
    }
  }

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
  onEscape(key, e) {
    if (!this.state.editor) {
      return;
    }

    const { codeMirror } = this.state.editor;
    if (codeMirror.listSelections().length > 1) {
      codeMirror.execCommand("singleSelection");
      e.preventDefault();
    }
  }

  onSearchAgain(_, e) {
    const { query, searchModifiers } = this.props;
    const { editor: { codeMirror } } = this.state.editor;
    const ctx = { ed: this.state.editor, cm: codeMirror };

    const direction = e.shiftKey ? "prev" : "next";
    traverseResults(e, ctx, query, direction, searchModifiers.toJS());
  }

  inSelectedFrameSource() {
    const { selectedLocation, selectedFrame } = this.props;
    return (
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId == selectedLocation.sourceId
    );
  }

  openMenu(event, editor) {
    const {
      selectedSource,
      selectedLocation,
      showSource,
      jumpToMappedLocation,
      addExpression,
      toggleBlackBox,
      getFunctionText
    } = this.props;

    return EditorMenu({
      editor,
      event,
      selectedLocation,
      selectedSource,
      showSource,
      jumpToMappedLocation,
      addExpression,
      toggleBlackBox,
      getFunctionText,
      onGutterContextMenu: this.onGutterContextMenu
    });
  }

  onGutterClick(cm, line, gutter, ev) {
    const {
      selectedSource,
      toggleBreakpoint,
      addOrToggleDisabledBreakpoint,
      isEmptyLine,
      continueToHere
    } = this.props;

    // ignore right clicks in the gutter
    if (
      (ev.ctrlKey && ev.button === 0) ||
      ev.which === 3 ||
      (selectedSource && selectedSource.get("isBlackBoxed"))
    ) {
      return;
    }

    if (isEmptyLine(line)) {
      return;
    }

    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel();
    }

    if (!selectedSource) {
      return;
    }

    if (gutter !== "CodeMirror-foldgutter") {
      if (ev.altKey) {
        continueToHere(toSourceLine(selectedSource.get("id"), line));
      } else if (ev.shiftKey) {
        addOrToggleDisabledBreakpoint(
          toSourceLine(selectedSource.get("id"), line)
        );
      } else {
        toggleBreakpoint(toSourceLine(selectedSource.get("id"), line));
      }
    }
  }

  onGutterContextMenu(event) {
    const {
      selectedSource,
      breakpoints,
      toggleBreakpoint,
      toggleDisabledBreakpoint,
      isEmptyLine,
      pauseData,
      continueToHere
    } = this.props;

    if (selectedSource && selectedSource.get("isBlackBoxed")) {
      event.preventDefault();
      return;
    }

    const sourceId = selectedSource ? selectedSource.get("id") : "";
    const line = lineAtHeight(this.state.editor, sourceId, event);
    const breakpoint = breakpoints.find(bp => bp.location.line === line);

    if (isEmptyLine(line - 1)) {
      return;
    }

    GutterMenu({
      event,
      line,
      breakpoint,
      toggleBreakpoint,
      toggleDisabledBreakpoint,
      pauseData,
      continueToHere,

      showConditionalPanel: this.toggleConditionalPanel,
      isCbPanelOpen: this.isCbPanelOpen(),
      closeConditionalPanel: this.closeConditionalPanel
    });
  }

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

  toggleConditionalPanel(line) {
    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel();
    }

    const {
      selectedLocation,
      setBreakpointCondition,
      breakpoints
    } = this.props;
    const sourceId = selectedLocation ? selectedLocation.sourceId : "";

    const breakpoint = breakpoints.find(bp => bp.location.line === line);
    const location = { sourceId, line };
    const condition = breakpoint ? breakpoint.condition : "";

    const panel = renderConditionalPanel({
      condition,
      setBreakpoint: value =>
        setBreakpointCondition(location, { condition: value }),
      closePanel: this.closeConditionalPanel
    });

    const editorLine = toEditorLine(sourceId, line);
    this.cbPanel = this.state.editor.codeMirror.addLineWidget(
      editorLine,
      panel,
      {
        coverGutter: true,
        noHScroll: false
      }
    );
    this.cbPanel.node.querySelector("input").focus();
  }

  closeConditionalPanel() {
    this.props.toggleConditionalBreakpointPanel(null);
    this.cbPanel.clear();
    this.cbPanel = null;
  }

  isCbPanelOpen() {
    return !!this.cbPanel;
  }

  // If the location has changed and a specific line is requested,
  // move to that line and flash it.
  highlightLine() {
    if (!this.pendingJumpLocation) {
      return;
    }

    // Make sure to clean up after ourselves. Not only does this
    // cancel any existing animation, but it avoids it from
    // happening ever again (in case CodeMirror re-applies the
    // class, etc).
    if (this.lastJumpLine) {
      clearLineClass(this.state.editor.codeMirror, "highlight-line");
    }

    const { sourceId, line: sourceLine } = this.pendingJumpLocation;
    const line = toEditorLine(sourceId, sourceLine);
    this.state.editor.alignLine(line);

    // We only want to do the flashing animation if it's not a debug
    // line, which has it's own styling.
    // Also, if it the first time the debugger is being loaded, we don't want
    // to flash the previously saved selected line.
    if (
      this.lastJumpLine &&
      (!this.props.selectedFrame ||
        this.props.selectedFrame.location.line !== line)
    ) {
      this.state.editor.codeMirror.addLineClass(line, "line", "highlight-line");
    }

    this.lastJumpLine = line;
    this.pendingJumpLocation = null;
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

  setText(nextProps) {
    if (!this.state.editor) {
      return;
    }

    if (!nextProps.selectedSource) {
      if (this.props.selectedSource) {
        return this.showMessage("");
      }

      return;
    }

    if (!isLoaded(nextProps.selectedSource.toJS())) {
      return showLoading(this.state.editor);
    }

    if (nextProps.selectedSource.get("error")) {
      return this.showMessage(nextProps.selectedSource.get("error"));
    }

    if (nextProps.selectedSource !== this.props.selectedSource) {
      return showSourceText(this.state.editor, nextProps.selectedSource.toJS());
    }
  }

  showMessage(msg) {
    if (!this.state.editor) {
      return;
    }

    resetLineNumberFormat(this.state.editor);
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

  renderHighlightLines() {
    const { highlightedLineRange } = this.props;

    if (!highlightedLineRange || !this.state.editor) {
      return;
    }

    return (
      <HighlightLines
        editor={this.state.editor}
        highlightedLineRange={highlightedLineRange}
      />
    );
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

  renderPreview() {
    const { selectedSource } = this.props;
    if (!this.state.editor || !selectedSource) {
      return null;
    }

    return <Preview editor={this.state.editor} />;
  }

  renderCallSites() {
    const editor = this.state.editor;

    if (!editor || !isEnabled("columnBreakpoints")) {
      return null;
    }
    return <CallSites editor={editor} />;
  }

  renderSearchBar() {
    const {
      selectSource,
      selectedSource,
      highlightLineRange,
      clearHighlightLineRange
    } = this.props;

    if (!this.state.editor) {
      return null;
    }

    return (
      <SearchBar
        editor={this.state.editor}
        selectSource={selectSource}
        selectedSource={selectedSource}
        highlightLineRange={highlightLineRange}
        clearHighlightLineRange={clearHighlightLineRange}
      />
    );
  }

  renderFooter() {
    const { horizontal } = this.props;

    if (!this.state.editor) {
      return null;
    }
    return <Footer editor={this.state.editor} horizontal={horizontal} />;
  }

  renderBreakpoints() {
    if (!this.state.editor) {
      return null;
    }

    return <Breakpoints editor={this.state.editor} />;
  }

  renderEmptyLines() {
    if (!this.state.editor) {
      return null;
    }

    return <EmptyLines editor={this.state.editor} />;
  }

  renderDebugLine() {
    const { editor } = this.state;
    const { selectedLocation, selectedFrame } = this.props;
    if (
      !editor ||
      !selectedLocation ||
      !selectedFrame ||
      !selectedLocation.line ||
      selectedFrame.location.sourceId !== selectedLocation.sourceId
    ) {
      return null;
    }

    return (
      <DebugLine
        editor={editor}
        selectedFrame={selectedFrame}
        selectedLocation={selectedLocation}
      />
    );
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
        {this.renderHighlightLines()}
        {this.renderHitCounts()}
        {this.renderFooter()}
        {this.renderPreview()}
        {this.renderCallSites()}
        {this.renderDebugLine()}
        {this.renderBreakpoints()}
        {this.renderEmptyLines()}
      </div>
    );
  }
}

Editor.propTypes = {
  breakpoints: ImPropTypes.map,
  hitCount: PropTypes.object,
  selectedLocation: PropTypes.object,
  selectedSource: ImPropTypes.map,
  highlightLineRange: PropTypes.func,
  clearHighlightLineRange: PropTypes.func,
  highlightedLineRange: PropTypes.object,
  searchOn: PropTypes.bool,
  addBreakpoint: PropTypes.func.isRequired,
  disableBreakpoint: PropTypes.func.isRequired,
  enableBreakpoint: PropTypes.func.isRequired,
  removeBreakpoint: PropTypes.func.isRequired,
  setBreakpointCondition: PropTypes.func.isRequired,
  selectSource: PropTypes.func,
  jumpToMappedLocation: PropTypes.func,
  toggleBlackBox: PropTypes.func,
  showSource: PropTypes.func,
  coverageOn: PropTypes.bool,
  pauseData: PropTypes.object,
  selectedFrame: PropTypes.object,
  addExpression: PropTypes.func.isRequired,
  horizontal: PropTypes.bool,
  query: PropTypes.string.isRequired,
  searchModifiers: ImPropTypes.recordOf({
    caseSensitive: PropTypes.bool.isRequired,
    regexMatch: PropTypes.bool.isRequired,
    wholeWord: PropTypes.bool.isRequired
  }).isRequired,
  startPanelSize: PropTypes.number,
  endPanelSize: PropTypes.number,
  linesInScope: PropTypes.array,
  toggleBreakpoint: PropTypes.func.isRequired,
  addOrToggleDisabledBreakpoint: PropTypes.func.isRequired,
  toggleDisabledBreakpoint: PropTypes.func.isRequired,
  conditionalBreakpointPanel: PropTypes.number,
  toggleConditionalBreakpointPanel: PropTypes.func.isRequired,
  isEmptyLine: PropTypes.func,
  continueToHere: PropTypes.func,
  getFunctionText: PropTypes.func
};

Editor.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => {
    const selectedLocation = getSelectedLocation(state);
    const sourceId = selectedLocation && selectedLocation.sourceId;
    const selectedSource = getSelectedSource(state);

    return {
      selectedLocation,
      selectedSource,
      highlightedLineRange: getHighlightedLineRange(state),
      searchOn: getActiveSearch(state) === "file",
      loadedObjects: getLoadedObjects(state),
      breakpoints: getVisibleBreakpoints(state),
      hitCount: getHitCountForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state),
      pauseData: getPause(state),
      coverageOn: getCoverageEnabled(state),
      query: getFileSearchQueryState(state),
      searchModifiers: getFileSearchModifierState(state),
      linesInScope: getInScopeLines(state),
      getFunctionText: line =>
        findFunctionText(
          line,
          selectedSource.toJS(),
          getSymbols(state, selectedSource.toJS())
        ),
      isEmptyLine: line =>
        isEmptyLineInSource(state, line, selectedSource.toJS()),
      conditionalBreakpointPanel: getConditionalBreakpointPanel(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
