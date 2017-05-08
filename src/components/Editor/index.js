// @flow
import { DOM as dom, PropTypes, createFactory, PureComponent } from "react";
import ReactDOM from "../../../node_modules/react-dom/dist/react-dom";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import classnames from "classnames";
import debounce from "lodash/debounce";
import { isEnabled } from "devtools-config";
import { getMode } from "../../utils/source";
import GutterMenu from "./GutterMenu";
import EditorMenu from "./EditorMenu";
import { renderConditionalPanel } from "./ConditionalPanel";
import { debugGlobal } from "devtools-launchpad";
import {
  getSourceText,
  getFileSearchState,
  getBreakpointsForSource,
  getSelectedLocation,
  getSelectedFrame,
  getSelectedSource,
  getHitCountForSource,
  getCoverageEnabled,
  getLoadedObjects,
  getPause,
  getFileSearchQueryState,
  getFileSearchModifierState
} from "../../selectors";

import { makeLocationId } from "../../reducers/breakpoints";
import actions from "../../actions";

import _Footer from "./Footer";
const Footer = createFactory(_Footer);

import _SearchBar from "./SearchBar";
const SearchBar = createFactory(_SearchBar);

import _Preview from "./Preview";
const Preview = createFactory(_Preview);

import _Breakpoint from "./Breakpoint";
const Breakpoint = createFactory(_Breakpoint);

import _ColumnBreakpoint from "./ColumnBreakpoint";
const ColumnBreakpoint = createFactory(_ColumnBreakpoint);

import _HitMarker from "./HitMarker";
const HitMarker = createFactory(_HitMarker);

import {
  getDocument,
  setDocument,
  updateDocument,
  shouldShowFooter,
  clearLineClass,
  createEditor,
  isTextForSource,
  breakpointAtLocation,
  getTextForLine,
  getCursorLine,
  resolveToken,
  previewExpression,
  getExpressionValue,
  resizeBreakpointGutter,
  traverseResults,
  getTokenLocation
} from "../../utils/editor";

import { getVisibleVariablesFromScope } from "../../utils/scopes";
import { isFirefox } from "devtools-config";
import "./Editor.css";

import { SourceEditor } from "devtools-source-editor";

const cssVars = {
  searchbarHeight: "var(--editor-searchbar-height)",
  secondSearchbarHeight: "var(--editor-second-searchbar-height)",
  footerHeight: "var(--editor-footer-height)"
};

export type SearchResults = {
  index: number,
  count: number
};

type EditorState = {
  searchResults: SearchResults,
  selectedToken: ?Object,
  selectedExpression: ?Object
};

class Editor extends PureComponent {
  cbPanel: any;
  editor: SourceEditor;
  pendingJumpLine: any;
  lastJumpLine: any;
  state: EditorState;

  constructor() {
    super();

    this.cbPanel = null;
    this.editor = null;
    this.pendingJumpLine = null;
    this.lastJumpLine = null;

    this.state = {
      searchResults: {
        index: -1,
        count: 0
      },
      selectedToken: null,
      selectedExpression: null
    };

    const self: any = this;
    self.closeConditionalPanel = this.closeConditionalPanel.bind(this);
    self.onEscape = this.onEscape.bind(this);
    self.onGutterClick = this.onGutterClick.bind(this);
    self.onGutterContextMenu = this.onGutterContextMenu.bind(this);
    self.onScroll = this.onScroll.bind(this);
    self.onSearchAgain = this.onSearchAgain.bind(this);
    self.onToggleBreakpoint = this.onToggleBreakpoint.bind(this);
    self.previewSelectedToken = debounce(
      this.previewSelectedToken.bind(this),
      100
    );
    self.toggleBreakpoint = this.toggleBreakpoint.bind(this);
    // eslint-disable-next-line max-len
    self.toggleBreakpointDisabledStatus = this.toggleBreakpointDisabledStatus.bind(
      this
    );
    self.toggleConditionalPanel = this.toggleConditionalPanel.bind(this);
    self.updateSearchResults = this.updateSearchResults.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const { sourceText, selectedLocation } = nextProps;
    this.clearDebugLine(this.props.selectedFrame);

    if (!sourceText) {
      if (this.props.sourceText) {
        this.showMessage("");
      }
    } else if (!isTextForSource(sourceText)) {
      this.showMessage(sourceText.get("error") || L10N.getStr("loadingText"));
    } else if (this.props.sourceText !== sourceText) {
      this.showSourceText(sourceText, selectedLocation);
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
    codeMirrorWrapper.addEventListener("click", e => this.onTokenClick(e));

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

    const { selectedSource, sourceText } = this.props;
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

    updateDocument(this.editor, selectedSource, sourceText);
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
    const { selectedLocation } = this.props;

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
    if (this.props.sourceText && isTextForSource(this.props.sourceText)) {
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
    const { codeMirror } = this.editor;
    if (codeMirror.listSelections().length > 1) {
      codeMirror.execCommand("singleSelection");
      e.preventDefault();
    }
  }

  onScroll(e) {
    return this.setState({ selectedToken: null, selectedExpression: null });
  }

  onMouseOver(e) {
    const { target } = e;
    if (!target.parentElement.closest(".CodeMirror-line")) {
      return;
    }
    this.previewSelectedToken(e);
  }

  onTokenClick(e) {
    const { target } = e;
    if (
      !isEnabled("columnBreakpoints") ||
      !e.altKey ||
      !target.parentElement.closest(".CodeMirror-line")
    ) {
      return;
    }

    const { line, column } = getTokenLocation(this.editor.codeMirror, target);
    this.toggleBreakpoint(line - 1, column - 1);
  }

  onSearchAgain(_, e) {
    const { query, searchModifiers } = this.props;
    const { editor: { codeMirror } } = this.editor;
    const ctx = { ed: this.editor, cm: codeMirror };

    const direction = e.shiftKey ? "prev" : "next";
    traverseResults(e, ctx, query, direction, searchModifiers.toJS());
  }

  async previewSelectedToken(e) {
    const {
      selectedFrame,
      selectedSource,
      pauseData,
      sourceText,
      addExpression
    } = this.props;
    const { selectedToken } = this.state;
    const token = e.target;

    if (
      !selectedFrame ||
      !sourceText ||
      !selectedSource ||
      selectedFrame.location.sourceId !== selectedSource.get("id")
    ) {
      return;
    }

    if (selectedToken) {
      selectedToken.classList.remove("selected-token");
      this.setState({ selectedToken: null, selectedExpression: null });
    }

    const { expression, inScope } = await resolveToken(
      this.editor.codeMirror,
      token,
      sourceText,
      selectedFrame
    );

    if (!inScope) {
      return;
    }

    const variables = getVisibleVariablesFromScope(pauseData, selectedFrame);

    if (expression) {
      addExpression(expression.value, { visible: false });
    }

    const displayedExpression = previewExpression({
      expression: expression,
      variables,
      selectedFrame,
      tokenText: token.textContent
    });

    if (displayedExpression) {
      this.setState({
        selectedToken: token,
        selectedExpression: displayedExpression
      });
    }
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

  updateSearchResults({ count, index = -1 }: { count: number, index: number }) {
    this.setState({ searchResults: { count, index } });
  }

  onGutterClick(cm, line, gutter, ev) {
    const { selectedSource } = this.props;

    // ignore right clicks in the gutter
    if (
      ev.which === 3 ||
      (selectedSource && selectedSource.get("isBlackBoxed"))
    ) {
      return;
    }

    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel(line);
    }

    if (gutter !== "CodeMirror-foldgutter") {
      this.toggleBreakpoint(line);
    }
  }

  onGutterContextMenu(event) {
    const { selectedSource } = this.props;

    if (selectedSource && selectedSource.get("isBlackBoxed")) {
      event.preventDefault();
      return;
    }

    const line = this.editor.codeMirror.lineAtHeight(event.clientY);
    const bp = breakpointAtLocation(this.props.breakpoints, { line });
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

    const bp = breakpointAtLocation(breakpoints, { line });
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
      noHScroll: true
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
    const bp = breakpointAtLocation(breakpoints, { line, column });

    if ((bp && bp.loading) || !selectedLocation || !selectedSource) {
      return;
    }

    const { sourceId } = selectedLocation;

    if (bp) {
      removeBreakpoint({
        sourceId: sourceId,
        line: line + 1,
        column: column
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
    const bp = breakpointAtLocation(this.props.breakpoints, { line });
    const { selectedLocation } = this.props;

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
      this.editor.codeMirror.removeLineClass(line - 1, "line", "debug-line");
    }
  }

  setDebugLine(selectedFrame, selectedLocation) {
    if (
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId === selectedLocation.sourceId
    ) {
      const line = selectedFrame.location.line;
      this.editor.codeMirror.addLineClass(line - 1, "line", "debug-line");
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
  showSourceText(sourceText, selectedLocation) {
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

    this.setText(sourceText.get("text"));
    this.editor.setMode(getMode(sourceText.toJS()));
  }

  renderBreakpoints() {
    const { breakpoints, sourceText, selectedSource } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    if (
      isLoading ||
      !breakpoints ||
      (selectedSource && selectedSource.get("isBlackBoxed"))
    ) {
      return;
    }

    const breakpointMarkers = breakpoints
      .valueSeq()
      .filter(b => !b.location.column)
      .map(bp =>
        Breakpoint({
          key: makeLocationId(bp.location),
          breakpoint: bp,
          editor: this.editor && this.editor.codeMirror
        })
      );

    const columnBreakpointBookmarks = breakpoints
      .valueSeq()
      .filter(b => b.location.column)
      .map(bp =>
        ColumnBreakpoint({
          key: makeLocationId(bp.location),
          breakpoint: bp,
          editor: this.editor && this.editor.codeMirror
        })
      );

    return breakpointMarkers.concat(columnBreakpointBookmarks);
  }

  renderHitCounts() {
    const { hitCount, sourceText } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    if (isLoading || !hitCount) {
      return;
    }

    return hitCount.filter(marker => marker.get("count") > 0).map(marker =>
      HitMarker({
        key: marker.get("line"),
        hitData: marker.toJS(),
        editor: this.editor && this.editor.codeMirror
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
    const { selectedToken, selectedExpression } = this.state;
    const { selectedFrame, sourceText } = this.props;

    if (!this.editor || !sourceText) {
      return null;
    }

    if (!selectedToken || !selectedFrame || !selectedExpression) {
      return;
    }

    const token = selectedToken.textContent;
    selectedToken.classList.add("selected-token");

    const value = getExpressionValue(selectedExpression, {
      getExpression: this.props.getExpression
    });

    if (!value) {
      return;
    }

    return Preview({
      value,
      expression: token,
      popoverTarget: selectedToken,
      onClose: () => {
        selectedToken.classList.remove("selected-token");
        this.setState({
          selectedToken: null,
          selectedExpression: null
        });
      }
    });
  }

  render() {
    const {
      sourceText,
      selectSource,
      selectedSource,
      coverageOn,
      horizontal
    } = this.props;

    const { searchResults } = this.state;

    return dom.div(
      {
        className: classnames("editor-wrapper", { "coverage-on": coverageOn })
      },
      SearchBar({
        editor: this.editor,
        selectSource,
        selectedSource,
        sourceText,
        searchResults,
        updateSearchResults: this.updateSearchResults
      }),
      dom.div({
        className: "editor-mount devtools-monospace",
        style: this.getInlineEditorStyles()
      }),
      this.renderBreakpoints(),
      this.renderHitCounts(),
      Footer({ editor: this.editor, horizontal }),
      this.renderPreview()
    );
  }
}

Editor.displayName = "Editor";

Editor.propTypes = {
  breakpoints: ImPropTypes.map.isRequired,
  hitCount: PropTypes.object,
  selectedLocation: PropTypes.object,
  selectedSource: ImPropTypes.map,
  sourceText: ImPropTypes.map,
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
  pauseData: ImPropTypes.map,
  selectedFrame: PropTypes.object,
  getExpression: PropTypes.func.isRequired,
  addExpression: PropTypes.func.isRequired,
  horizontal: PropTypes.bool,
  query: PropTypes.string.isRequired,
  searchModifiers: ImPropTypes.recordOf({
    caseSensitive: PropTypes.bool.isRequired,
    regexMatch: PropTypes.bool.isRequired,
    wholeWord: PropTypes.bool.isRequired
  }).isRequired
};

Editor.contextTypes = {
  shortcuts: PropTypes.object
};

const expressionsSel = state => state.expressions.expressions;
const getExpressionSel = createSelector(expressionsSel, expressions => input =>
  expressions.find(exp => exp.input == input));

export default connect(
  state => {
    const selectedLocation = getSelectedLocation(state);
    const sourceId = selectedLocation && selectedLocation.sourceId;
    const selectedSource = getSelectedSource(state);

    return {
      selectedLocation,
      selectedSource,
      searchOn: getFileSearchState(state),
      sourceText: getSourceText(state, sourceId),
      loadedObjects: getLoadedObjects(state),
      breakpoints: getBreakpointsForSource(state, sourceId || ""),
      hitCount: getHitCountForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state),
      getExpression: getExpressionSel(state),
      pauseData: getPause(state),
      coverageOn: getCoverageEnabled(state),
      query: getFileSearchQueryState(state),
      searchModifiers: getFileSearchModifierState(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
