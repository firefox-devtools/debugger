// @flow
import { DOM as dom, PropTypes, createFactory, PureComponent } from "react";
import ReactDOM from "react-dom";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import { isEnabled } from "devtools-config";
import debounce from "lodash/debounce";
import GutterMenu from "./GutterMenu";
import EditorMenu from "./EditorMenu";
import { renderConditionalPanel } from "./ConditionalPanel";
import { debugGlobal } from "devtools-launchpad";

import {
  getActiveSearchState,
  getSelectedLocation,
  getSelectedFrame,
  getSelectedSource,
  getHighlightedLineRange,
  getHitCountForSource,
  getCoverageEnabled,
  getLoadedObjects,
  getPause,
  getSelection,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getVisibleBreakpoints,
  getInScopeLines
} from "../../selectors";

import actions from "../../actions";

import _Footer from "./Footer";
const Footer = createFactory(_Footer);

import _SearchBar from "./SearchBar";
const SearchBar = createFactory(_SearchBar);

import _HighlightLines from "./HighlightLines";
const HighlightLines = createFactory(_HighlightLines);

import _Preview from "./Preview";
const Preview = createFactory(_Preview);

import _Breakpoints from "./Breakpoints";
const Breakpoints = createFactory(_Breakpoints);
import _HitMarker from "./HitMarker";
const HitMarker = createFactory(_HitMarker);

import _CallSites from "./CallSites";
const CallSites = createFactory(_CallSites);

import {
  showSourceText,
  updateDocument,
  shouldShowFooter,
  clearLineClass,
  createEditor,
  getCursorLine,
  resizeBreakpointGutter,
  traverseResults,
  updateSelection,
  markText,
  lineAtHeight,
  toSourceLine,
  toEditorLine,
  toEditorPosition,
  toEditorRange,
  resetLineNumberFormat
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

let debugExpression;
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
    self.onScroll = this.onScroll.bind(this);
    self.onSearchAgain = this.onSearchAgain.bind(this);
    self.onToggleBreakpoint = this.onToggleBreakpoint.bind(this);
    self.onMouseOver = debounce(this.onMouseOver, 40);
    self.toggleConditionalPanel = this.toggleConditionalPanel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const { selectedSource, selectedLocation } = nextProps;

    if (
      nextProps.startPanelSize !== this.props.startPanelSize ||
      nextProps.endPanelSize !== this.props.endPanelSize
    ) {
      this.state.editor.codeMirror.setSize();
    }

    if (!selectedSource) {
      if (this.props.selectedSource) {
        this.showMessage("");
      }
    } else if (selectedSource.get("loading")) {
      this.showMessage(L10N.getStr("loadingText"));
    } else if (selectedSource.get("error")) {
      this.showMessage(selectedSource.get("error"));
    } else if (this.props.selectedSource !== selectedSource) {
      showSourceText(this.state.editor, selectedSource.toJS());
    }

    if (
      this.state.editor &&
      this.props.linesInScope !== nextProps.linesInScope
    ) {
      this.state.editor.codeMirror.operation(() => {
        clearLineClass(this.state.editor.codeMirror, "in-scope");
      });

      this.clearDebugLine(this.props.selectedFrame);
      this.setDebugLine(nextProps.selectedFrame, selectedLocation);
      resizeBreakpointGutter(this.state.editor.codeMirror);
    }
  }

  setupEditor() {
    const editor = createEditor();

    // disables the default search shortcuts
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
    codeMirrorWrapper.addEventListener("mouseover", e => this.onMouseOver(e));

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

      codeMirror.on("contextmenu", (cm, event) => this.openMenu(event, cm));
    } else {
      codeMirrorWrapper.addEventListener("contextmenu", event =>
        this.openMenu(event, codeMirror)
      );
    }

    codeMirror.on("scroll", this.onScroll);

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

    shortcuts.on("CmdOrCtrl+B", this.onToggleBreakpoint);
    shortcuts.on("CmdOrCtrl+Shift+B", this.onToggleBreakpoint);
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
    shortcuts.off("CmdOrCtrl+B");
    shortcuts.off("CmdOrCtrl+Shift+B");
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
    let { key, target } = e;
    let codeWrapper = codeMirror.getWrapperElement();
    let textArea = codeWrapper.querySelector("textArea");

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

  onScroll() {
    this.clearPreviewSelection();
  }

  onSearchAgain(_, e) {
    const { query, searchModifiers } = this.props;
    const { editor: { codeMirror } } = this.state.editor;
    const ctx = { ed: this.state.editor, cm: codeMirror };

    const direction = e.shiftKey ? "prev" : "next";
    traverseResults(e, ctx, query, direction, searchModifiers.toJS());
  }

  clearPreviewSelection() {
    this.props.clearSelection();
  }

  inSelectedFrameSource() {
    const { selectedLocation, selectedFrame } = this.props;
    return (
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId == selectedLocation.sourceId
    );
  }

  openMenu(event, codeMirror) {
    const {
      selectedSource,
      selectedLocation,
      showSource,
      jumpToMappedLocation,
      addExpression,
      toggleBlackBox
    } = this.props;

    return EditorMenu({
      codeMirror,
      event,
      selectedLocation,
      selectedSource,
      showSource,
      jumpToMappedLocation,
      addExpression,
      toggleBlackBox,
      onGutterContextMenu: this.onGutterContextMenu
    });
  }

  onGutterClick(cm, line, gutter, ev) {
    const { selectedSource, toggleBreakpoint } = this.props;

    // ignore right clicks in the gutter
    if (
      (ev.ctrlKey && ev.button === 0) ||
      ev.which === 3 ||
      (selectedSource && selectedSource.get("isBlackBoxed"))
    ) {
      return;
    }

    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel();
    }

    if (!selectedSource) {
      return;
    }

    if (gutter !== "CodeMirror-foldgutter") {
      toggleBreakpoint(toSourceLine(selectedSource.get("id"), line));
    }
  }

  onGutterContextMenu(event) {
    const {
      selectedSource,
      breakpoints,
      toggleBreakpoint,
      toggleDisabledBreakpoint
    } = this.props;

    if (selectedSource && selectedSource.get("isBlackBoxed")) {
      event.preventDefault();
      return;
    }

    const sourceId = selectedSource ? selectedSource.get("id") : "";
    const line = lineAtHeight(this.state.editor, sourceId, event);
    const breakpoint = breakpoints.find(bp => bp.location.line === line);

    GutterMenu({
      event,
      line,
      breakpoint,
      toggleBreakpoint,
      toggleDisabledBreakpoint,

      showConditionalPanel: this.toggleConditionalPanel,
      isCbPanelOpen: this.isCbPanelOpen(),
      closeConditionalPanel: this.closeConditionalPanel
    });
  }

  onMouseOver(e) {
    const { target } = e;
    if (this.inSelectedFrameSource()) {
      updateSelection(target, this.state.editor, this.props);
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

    this.cbPanel = this.state.editor.codeMirror.addLineWidget(line, panel, {
      coverGutter: true,
      noHScroll: false
    });
    this.cbPanel.node.querySelector("input").focus();
  }

  closeConditionalPanel() {
    this.cbPanel.clear();
    this.cbPanel = null;
  }

  isCbPanelOpen() {
    return !!this.cbPanel;
  }

  clearDebugLine(selectedFrame) {
    if (this.state.editor && selectedFrame) {
      const { sourceId, line } = selectedFrame.location;
      if (debugExpression) {
        debugExpression.clear();
      }

      let editorLine = toEditorLine(sourceId, line);
      this.state.editor.codeMirror.removeLineClass(
        editorLine,
        "line",
        "new-debug-line"
      );
    }
  }

  setDebugLine(selectedFrame, selectedLocation) {
    if (
      this.state.editor &&
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId === selectedLocation.sourceId
    ) {
      const { location, sourceId } = selectedFrame;
      const { line, column } = toEditorPosition(sourceId, location);

      this.state.editor.codeMirror.addLineClass(line, "line", "new-debug-line");
      debugExpression = markText(this.state.editor, "debug-expression", {
        start: { line, column },
        end: { line, column: null }
      });
    }
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
    let line = toEditorLine(sourceId, sourceLine);
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

  showMessage(msg) {
    this.state.editor.replaceDocument(this.state.editor.createDocument());
    this.state.editor.setText(msg);
    this.state.editor.setMode({ name: "text" });
    resetLineNumberFormat(this.state.editor);
  }

  getInlineEditorStyles() {
    const { selectedSource, horizontal, searchOn } = this.props;

    let subtractions = [];

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

  getInlineEditorStyles() {
    const { selectedSource, horizontal, searchOn } = this.props;

    let subtractions = [];

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

    if (!highlightedLineRange) {
      return;
    }

    return HighlightLines({
      editor: this.state.editor,
      highlightedLineRange
    });
  }

  renderHitCounts() {
    const { hitCount, selectedSource } = this.props;

    if (
      !selectedSource ||
      selectedSource.get("loading") ||
      !hitCount ||
      !this.state.editor
    ) {
      return;
    }

    return hitCount.filter(marker => marker.get("count") > 0).map(marker =>
      HitMarker({
        key: marker.get("line"),
        hitData: marker.toJS(),
        editor: this.state.editor.codeMirror
      })
    );
  }

  renderPreview() {
    const { selectedSource, selection } = this.props;
    if (!this.state.editor || !selectedSource) {
      return null;
    }

    if (!selection || selection.updating) {
      return;
    }

    const { result, expression, location, cursorPos } = selection;
    const value = result;
    if (typeof value == "undefined" || value.optimizedOut) {
      return;
    }

    const editorRange = toEditorRange(selectedSource.get("id"), location);

    return Preview({
      value,
      editor: this.state.editor,
      range: editorRange,
      expression: expression,
      popoverPos: cursorPos,
      onClose: () => this.clearPreviewSelection()
    });
  }

  renderInScopeLines() {
    const { linesInScope } = this.props;
    if (
      !this.state.editor ||
      !isEnabled("highlightScopeLines") ||
      !linesInScope ||
      !this.inSelectedFrameSource()
    ) {
      return;
    }

    this.state.editor.codeMirror.operation(() => {
      linesInScope.forEach(line => {
        this.state.editor.codeMirror.addLineClass(line - 1, "line", "in-scope");
      });
    });
  }

  renderCallSites() {
    const editor = this.state.editor;

    if (!editor || !isEnabled("columnBreakpoints")) {
      return null;
    }
    return CallSites({ editor });
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

    return SearchBar({
      editor: this.state.editor,
      selectSource,
      selectedSource,
      highlightLineRange,
      clearHighlightLineRange
    });
  }

  renderFooter() {
    const { horizontal } = this.props;

    if (!this.state.editor) {
      return null;
    }
    return Footer({ editor: this.state.editor, horizontal });
  }

  renderBreakpoints() {
    if (!this.state.editor) {
      return null;
    }

    return Breakpoints({ editor: this.state.editor });
  }

  render() {
    const { coverageOn, pauseData } = this.props;

    return dom.div(
      {
        className: classnames("editor-wrapper", {
          "coverage-on": coverageOn,
          paused: !!pauseData && isEnabled("highlightScopeLines")
        })
      },
      this.renderSearchBar(),
      dom.div({
        className: "editor-mount devtools-monospace",
        style: this.getInlineEditorStyles()
      }),
      this.renderHighlightLines(),
      this.renderInScopeLines(),
      this.renderHitCounts(),
      this.renderFooter(),
      this.renderPreview(),
      this.renderCallSites(),
      this.renderBreakpoints()
    );
  }
}

Editor.displayName = "Editor";

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
  selection: PropTypes.object,
  startPanelSize: PropTypes.number,
  endPanelSize: PropTypes.number,
  clearSelection: PropTypes.func.isRequired,
  linesInScope: PropTypes.array,
  toggleBreakpoint: PropTypes.func.isRequired,
  toggleDisabledBreakpoint: PropTypes.func.isRequired
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
      searchOn: getActiveSearchState(state) === "file",
      loadedObjects: getLoadedObjects(state),
      breakpoints: getVisibleBreakpoints(state),
      hitCount: getHitCountForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state),
      pauseData: getPause(state),
      coverageOn: getCoverageEnabled(state),
      query: getFileSearchQueryState(state),
      searchModifiers: getFileSearchModifierState(state),
      linesInScope: getInScopeLines(state),
      selection: getSelection(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
