// @flow
import { DOM as dom, PropTypes, createFactory, PureComponent } from "react";
import ReactDOM from "react-dom";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import { isEnabled } from "devtools-config";
import debounce from "lodash/debounce";
import { getMode } from "../../utils/source";
import GutterMenu from "./GutterMenu";
import EditorMenu from "./EditorMenu";
import { renderConditionalPanel } from "./ConditionalPanel";
import { debugGlobal } from "devtools-launchpad";

import {
  getActiveSearchState,
  getBreakpointsForSource,
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
  getFileSearchModifierState
} from "../../selectors";

import getInScopeLines from "../../selectors/linesInScope";

import { makeLocationId, breakpointAtLocation } from "../../utils/breakpoint";
import actions from "../../actions";

import _Footer from "./Footer";
const Footer = createFactory(_Footer);

import _SearchBar from "./SearchBar";
const SearchBar = createFactory(_SearchBar);

import _SymbolModal from "./SymbolModal";
const SymbolModal = createFactory(_SymbolModal);

import _HighlightLines from "./HighlightLines";
const HighlightLines = createFactory(_HighlightLines);

import _Preview from "./Preview";
const Preview = createFactory(_Preview);

import _Breakpoint from "./Breakpoint";
const Breakpoint = createFactory(_Breakpoint);

import _HitMarker from "./HitMarker";
const HitMarker = createFactory(_HitMarker);

import _CallSites from "./CallSites";
const CallSites = createFactory(_CallSites);

import {
  getDocument,
  setDocument,
  updateDocument,
  shouldShowFooter,
  clearLineClass,
  createEditor,
  getTextForLine,
  getCursorLine,
  resizeBreakpointGutter,
  traverseResults,
  updateSelection,
  markText
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

type EditorState = {
  highlightedLineRange: ?Object
};

class Editor extends PureComponent {
  cbPanel: any;
  editor: SourceEditor;
  pendingJumpLine: any;
  lastJumpLine: any;
  debugExpression: any;
  state: EditorState;

  constructor() {
    super();

    this.cbPanel = null;
    this.editor = null;
    this.pendingJumpLine = null;
    this.lastJumpLine = null;

    this.state = {
      highlightedLineRange: null
    };

    const self: any = this;
    self.closeConditionalPanel = this.closeConditionalPanel.bind(this);
    self.onEscape = this.onEscape.bind(this);
    self.onGutterClick = this.onGutterClick.bind(this);
    self.onGutterContextMenu = this.onGutterContextMenu.bind(this);
    self.onScroll = this.onScroll.bind(this);
    self.onSearchAgain = this.onSearchAgain.bind(this);
    self.onToggleBreakpoint = this.onToggleBreakpoint.bind(this);
    self.toggleBreakpoint = this.toggleBreakpoint.bind(this);
    self.onMouseOver = debounce(this.onMouseOver, 40);

    // eslint-disable-next-line max-len
    self.toggleBreakpointDisabledStatus = this.toggleBreakpointDisabledStatus.bind(
      this
    );
    self.toggleConditionalPanel = this.toggleConditionalPanel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const { selectedSource, selectedLocation } = nextProps;
    this.clearDebugLine(this.props.selectedFrame);

    if (
      nextProps.startPanelSize !== this.props.startPanelSize ||
      nextProps.endPanelSize !== this.props.endPanelSize
    ) {
      this.editor.codeMirror.setSize();
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
      this.showSourceText(selectedSource, selectedLocation);
    }

    if (this.props.linesInScope !== nextProps.linesInScope) {
      this.editor.codeMirror.operation(() => {
        clearLineClass(this.editor.codeMirror, "in-scope");
      });
    }

    this.setDebugLine(nextProps.selectedFrame, selectedLocation);
    resizeBreakpointGutter(this.editor.codeMirror);
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

    return editor;
  }

  componentDidMount() {
    this.cbPanel = null;
    this.editor = this.setupEditor();

    const { selectedSource } = this.props;
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

    updateDocument(this.editor, selectedSource);
  }

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;

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
        this.pendingJumpLine = selectedLocation.line;
      } else {
        this.pendingJumpLine = null;
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
    const { codeMirror } = this.editor;
    const line = getCursorLine(codeMirror);

    if (e.shiftKey) {
      this.toggleConditionalPanel(line);
    } else {
      this.toggleBreakpoint(line);
    }
  }

  onKeyDown(e) {
    const { codeMirror } = this.editor;
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
    if (!this.editor) {
      return;
    }

    const { codeMirror } = this.editor;
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
    const { editor: { codeMirror } } = this.editor;
    const ctx = { ed: this.editor, cm: codeMirror };

    const direction = e.shiftKey ? "prev" : "next";
    traverseResults(e, ctx, query, direction, searchModifiers.toJS());
  }

  clearPreviewSelection() {
    this.props.clearSelection();
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
    const { selectedSource } = this.props;

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

    if (gutter !== "CodeMirror-foldgutter") {
      this.toggleBreakpoint(line);
    }
  }

  onGutterContextMenu(event) {
    const { selectedSource, selectedLocation, breakpoints } = this.props;

    if (selectedSource && selectedSource.get("isBlackBoxed")) {
      event.preventDefault();
      return;
    }

    const line = this.editor.codeMirror.lineAtHeight(event.clientY);
    const bp = breakpointAtLocation(breakpoints, selectedLocation, { line });
    GutterMenu({
      event,
      line,
      bp,
      toggleBreakpoint: this.toggleBreakpoint,
      showConditionalPanel: this.toggleConditionalPanel,
      toggleBreakpointDisabledStatus: this.toggleBreakpointDisabledStatus,
      isCbPanelOpen: this.isCbPanelOpen(),
      closeConditionalPanel: this.closeConditionalPanel
    });
  }

  onMouseOver(e) {
    const { target } = e;
    if (this.inSelectedFrameSource()) {
      updateSelection(target, this.editor, this.props);
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

    const bp = breakpointAtLocation(breakpoints, selectedLocation, { line });
    const location = { sourceId, line: line + 1 };
    const condition = bp ? bp.condition : "";

    const setBreakpoint = value =>
      setBreakpointCondition(location, {
        condition: value,
        getTextForLine: l => getTextForLine(this.editor.codeMirror, l)
      });

    const panel = renderConditionalPanel({
      condition,
      setBreakpoint,
      closePanel: this.closeConditionalPanel
    });

    this.cbPanel = this.editor.codeMirror.addLineWidget(line, panel, {
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

  toggleBreakpoint(line, column = undefined) {
    const {
      selectedSource,
      selectedLocation,
      breakpoints,
      addBreakpoint,
      removeBreakpoint
    } = this.props;
    const bp = breakpointAtLocation(breakpoints, selectedLocation, {
      line,
      column
    });

    if ((bp && bp.loading) || !selectedLocation || !selectedSource) {
      return;
    }

    const { sourceId } = selectedLocation;

    if (bp) {
      // NOTE: it's possible the breakpoint has slid to a column
      removeBreakpoint({
        sourceId: bp.location.sourceId,
        line: bp.location.line,
        column: column || bp.location.column
      });
    } else {
      addBreakpoint(
        {
          sourceId: sourceId,
          sourceUrl: selectedSource.get("url"),
          line: line + 1,
          column: column
        },
        // Pass in a function to get line text because the breakpoint
        // may slide and it needs to compute the value at the new
        // line.
        { getTextForLine: l => getTextForLine(this.editor.codeMirror, l) }
      );
    }
  }

  toggleBreakpointDisabledStatus(line) {
    const { breakpoints, selectedLocation } = this.props;
    const bp = breakpointAtLocation(breakpoints, selectedLocation, { line });

    if ((bp && bp.loading) || !selectedLocation) {
      return;
    }

    const { sourceId } = selectedLocation;

    if (!bp) {
      throw new Error("attempt to disable breakpoint that does not exist");
    }

    if (!bp.disabled) {
      this.props.disableBreakpoint({
        sourceId: sourceId,
        line: line + 1
      });
    } else {
      this.props.enableBreakpoint({
        sourceId: sourceId,
        line: line + 1
      });
    }
  }

  clearDebugLine(selectedFrame) {
    if (selectedFrame) {
      const line = selectedFrame.location.line;
      if (this.debugExpression) {
        this.debugExpression.clear();
      }

      this.editor.codeMirror.removeLineClass(
        line - 1,
        "line",
        "new-debug-line"
      );
    }
  }

  setDebugLine(selectedFrame, selectedLocation) {
    if (
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId === selectedLocation.sourceId
    ) {
      const { line, column } = selectedFrame.location;
      this.editor.codeMirror.addLineClass(line - 1, "line", "new-debug-line");

      this.debugExpression = markText(this.editor, "debug-expression", {
        start: { line, column },
        end: { line, column: null }
      });
    }
  }

  // If the location has changed and a specific line is requested,
  // move to that line and flash it.
  highlightLine() {
    if (!this.pendingJumpLine) {
      return;
    }

    // Make sure to clean up after ourselves. Not only does this
    // cancel any existing animation, but it avoids it from
    // happening ever again (in case CodeMirror re-applies the
    // class, etc).
    if (this.lastJumpLine) {
      clearLineClass(this.editor.codeMirror, "highlight-line");
    }

    const line = this.pendingJumpLine;
    this.editor.alignLine(line);

    // We only want to do the flashing animation if it's not a debug
    // line, which has it's own styling.
    // Also, if it the first time the debugger is being loaded, we don't want
    // to flash the previously saved selected line.
    if (
      this.lastJumpLine &&
      (!this.props.selectedFrame ||
        this.props.selectedFrame.location.line !== line)
    ) {
      this.editor.codeMirror.addLineClass(line - 1, "line", "highlight-line");
    }

    this.lastJumpLine = line;
    this.pendingJumpLine = null;
  }

  setText(text) {
    if (!text || !this.editor) {
      return;
    }

    this.editor.setText(text);
  }

  showMessage(msg) {
    this.editor.replaceDocument(this.editor.createDocument());
    this.setText(msg);
    this.editor.setMode({ name: "text" });
  }

  /**
   * Handle getting the source document or creating a new
   * document with the correct mode and text.
   *
   */
  showSourceText(source, selectedLocation) {
    if (!selectedLocation) {
      return;
    }

    let doc = getDocument(selectedLocation.sourceId);
    if (doc) {
      this.editor.replaceDocument(doc);
      return doc;
    }

    doc = this.editor.createDocument();
    setDocument(selectedLocation.sourceId, doc);
    this.editor.replaceDocument(doc);

    this.setText(source.get("text"));
    this.editor.setMode(getMode(source.toJS()));
  }

  renderHighlightLines() {
    const { highlightedLineRange } = this.props;

    if (!highlightedLineRange) {
      return;
    }

    return HighlightLines({
      editor: this.editor,
      highlightedLineRange
    });
  }

  renderBreakpoints() {
    const { breakpoints, selectedSource } = this.props;

    if (
      !selectedSource ||
      selectedSource.get("loading") ||
      !breakpoints ||
      (selectedSource && selectedSource.get("isBlackBoxed"))
    ) {
      return;
    }

    const breakpointMarkers = breakpoints
      .valueSeq()
      .filter(b => (isEnabled("columnBreakpoints") ? !b.location.column : true))
      .map(bp =>
        Breakpoint({
          key: makeLocationId(bp.location),
          selectedSource,
          breakpoint: bp,
          editor: this.editor && this.editor.codeMirror
        })
      );

    return breakpointMarkers;
  }

  renderHitCounts() {
    const { hitCount, selectedSource } = this.props;

    if (
      !selectedSource ||
      selectedSource.get("loading") ||
      !hitCount ||
      !this.editor
    ) {
      return;
    }

    return hitCount.filter(marker => marker.get("count") > 0).map(marker =>
      HitMarker({
        key: marker.get("line"),
        hitData: marker.toJS(),
        editor: this.editor.codeMirror
      })
    );
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
      height: subtractions.length === 0
        ? "100%"
        : `calc(100% - ${subtractions.join(" - ")})`
    };
  }

  renderPreview() {
    const { selectedSource, selection } = this.props;
    if (!this.editor || !selectedSource) {
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

    return Preview({
      value,
      editor: this.editor,
      location: location,
      expression: expression,
      popoverPos: cursorPos,
      onClose: () => this.clearPreviewSelection()
    });
  }

  renderInScopeLines() {
    const { linesInScope } = this.props;
    if (
      !isEnabled("highlightScopeLines") ||
      !linesInScope ||
      !this.inSelectedFrameSource()
    ) {
      return;
    }

    this.editor.codeMirror.operation(() => {
      linesInScope.forEach(line => {
        this.editor.codeMirror.addLineClass(line - 1, "line", "in-scope");
      });
    });
  }

  inSelectedFrameSource() {
    const { selectedLocation, selectedFrame } = this.props;
    return (
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId == selectedLocation.sourceId
    );
  }

  renderCallSites() {
    const editor = this.editor;

    if (!editor || !isEnabled("columnBreakpoints")) {
      return null;
    }
    return CallSites({ editor });
  }

  render() {
    const {
      selectSource,
      selectedSource,
      highlightLineRange,
      clearHighlightLineRange,
      coverageOn,
      pauseData,
      horizontal
    } = this.props;

    return dom.div(
      {
        className: classnames("editor-wrapper", {
          "coverage-on": coverageOn,
          paused: !!pauseData && isEnabled("highlightScopeLines")
        })
      },
      SearchBar({
        editor: this.editor,
        selectSource,
        selectedSource,
        highlightLineRange,
        clearHighlightLineRange
      }),
      SymbolModal({ selectSource, selectedSource }),
      dom.div({
        className: "editor-mount devtools-monospace",
        style: this.getInlineEditorStyles()
      }),
      this.renderHighlightLines(),
      this.renderBreakpoints(),
      this.renderInScopeLines(),
      this.renderHitCounts(),
      Footer({ editor: this.editor, horizontal }),
      this.renderPreview(),
      this.renderCallSites()
    );
  }
}

Editor.displayName = "Editor";

Editor.propTypes = {
  breakpoints: ImPropTypes.map.isRequired,
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
  linesInScope: PropTypes.array
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
      breakpoints: getBreakpointsForSource(state, sourceId),
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
