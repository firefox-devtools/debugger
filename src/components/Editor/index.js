// @flow
const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;

const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");
const debounce = require("lodash/debounce");

const { getMode } = require("../../utils/source");

const Footer = createFactory(require("./Footer").default);
const SearchBar = createFactory(require("./SearchBar"));
const GutterMenu = require("./GutterMenu");
const EditorMenu = require("./EditorMenu");
const Preview = createFactory(require("./Preview").default);
const { renderConditionalPanel } = require("./ConditionalPanel");
const { debugGlobal } = require("devtools-launchpad");
const { isEnabled } = require("devtools-config");
const {
  getSourceText,
  getBreakpointsForSource,
  getSelectedLocation,
  getSelectedFrame,
  getSelectedSource,
  getExpression,
  getHitCountForSource,
  getCoverageEnabled,
  getLoadedObjects,
  getPause,
  getFileSearchQueryState,
  getFileSearchModifierState
} = require("../../selectors");
const { makeLocationId } = require("../../reducers/breakpoints");
const actions = require("../../actions").default;
const Breakpoint = React.createFactory(require("./Breakpoint").default);
const HitMarker = React.createFactory(require("./HitMarker"));

const {
  getDocument,
  setDocument,
  updateDocument,
  shouldShowFooter,
  clearLineClass,
  createEditor,
  isTextForSource,
  breakpointAtLine,
  getTextForLine,
  getCursorLine,
  resolveToken,
  previewExpression,
  getExpressionValue,
  resizeBreakpointGutter,
  traverseResults
} = require("../../utils/editor");
const { getVisibleVariablesFromScope } = require("../../utils/scopes");
const { isFirefox } = require("devtools-config");

require("./Editor.css");

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    hitCount: PropTypes.object,
    selectedLocation: PropTypes.object,
    selectedSource: ImPropTypes.map,
    sourceText: ImPropTypes.map,
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
  },

  cbPanel: (null: any),
  editor: (null: any),
  pendingJumpLine: (null: any),
  lastJumpLine: (null: any),

  displayName: "Editor",

  getInitialState() {
    return {
      searchResults: {
        index: -1,
        count: 0
      },
      selectedToken: null,
      selectedExpression: null
    };
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const { sourceText, selectedLocation } = nextProps;
    this.clearDebugLine(this.props.selectedFrame);

    if (!sourceText) {
      this.showMessage("");
    } else if (!isTextForSource(sourceText)) {
      this.showMessage(sourceText.get("error") || L10N.getStr("loadingText"));
    } else if (this.props.sourceText !== sourceText) {
      this.showSourceText(sourceText, selectedLocation);
    }

    this.setDebugLine(nextProps.selectedFrame, selectedLocation);
    resizeBreakpointGutter(this.editor.codeMirror);
  },

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

    const ctx = { ed: editor, cm: codeMirror };

    codeMirrorWrapper.addEventListener("mouseup", e => this.onMouseUp(e, ctx));
    codeMirrorWrapper.addEventListener("mouseover", e => this.onMouseOver(e));

    if (!isFirefox()) {
      codeMirror.on("gutterContextMenu", (cm, line, eventName, event) =>
        this.onGutterContextMenu(event));

      codeMirror.on("contextmenu", (cm, event) => this.openMenu(event, cm));
    } else {
      codeMirrorWrapper.addEventListener("contextmenu", event =>
        this.openMenu(event, codeMirror));
    }

    codeMirror.on("scroll", this.onScroll);

    return editor;
  },

  componentDidMount() {
    this.cbPanel = null;
    this.editor = this.setupEditor();

    const { selectedSource, sourceText } = this.props;
    const { shortcuts } = this.context;

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");

    shortcuts.on("CmdOrCtrl+B", this.onToggleBreakpoint);
    shortcuts.on("CmdOrCtrl+Shift+B", this.onToggleBreakpoint);
    shortcuts.on("Esc", this.onEscape);
    shortcuts.on(`CmdOrCtrl+Shift+${searchAgainKey}`, this.onSearchAgain);
    shortcuts.on(`CmdOrCtrl+${searchAgainKey}`, this.onSearchAgain);

    updateDocument(this.editor, selectedSource, sourceText);
    (this: any).previewSelectedToken = debounce(this.previewSelectedToken, 100);
  },

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    const shortcuts = this.context.shortcuts;
    shortcuts.off("CmdOrCtrl+B");
    shortcuts.off("CmdOrCtrl+Shift+B");
    shortcuts.off(`CmdOrCtrl+Shift+${searchAgainKey}`);
    shortcuts.off(`CmdOrCtrl+${searchAgainKey}`);
  },

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
  },

  onToggleBreakpoint(key, e) {
    e.preventDefault();
    const { codeMirror } = this.editor;
    const line = getCursorLine(codeMirror);

    if (e.shiftKey) {
      this.toggleConditionalPanel(line);
    } else {
      this.toggleBreakpoint(line);
    }
  },

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
  },

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
  },

  onMouseUp(e, ctx) {
    if (e.metaKey) {
      this.previewSelectedToken(e, ctx);
    }
  },

  onScroll(e) {
    return this.setState({ selectedToken: null, selectedExpression: null });
  },

  onMouseOver(e) {
    this.previewSelectedToken(e);
  },

  onSearchAgain(_, e) {
    const { query, searchModifiers } = this.props;
    const { editor: { codeMirror } } = this.editor;
    const ctx = { ed: this.editor, cm: codeMirror };

    if (!searchModifiers) {
      return;
    }

    const direction = e.shiftKey ? "prev" : "next";
    traverseResults(e, ctx, query, direction, searchModifiers.toJS());
  },

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
      !isEnabled("editorPreview") ||
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
  },

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
  },

  updateSearchResults({ count, index = -1 }: { count: number, index: number }) {
    this.setState({ searchResults: { count, index } });
  },

  onGutterClick(cm, line, gutter, ev) {
    const { selectedSource } = this.props;

    // ignore right clicks in the gutter
    if (
      ev.which === 3 || (selectedSource && selectedSource.get("isBlackBoxed"))
    ) {
      return;
    }

    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel(line);
    }

    if (gutter !== "CodeMirror-foldgutter") {
      this.toggleBreakpoint(line);
    }
  },

  onGutterContextMenu(event) {
    const { selectedSource } = this.props;

    if (selectedSource && selectedSource.get("isBlackBoxed")) {
      event.preventDefault();
      return;
    }

    const line = this.editor.codeMirror.lineAtHeight(event.clientY);
    const bp = breakpointAtLine(this.props.breakpoints, line);
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
  },

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

    const bp = breakpointAtLine(breakpoints, line);
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
  },

  closeConditionalPanel() {
    this.cbPanel.clear();
    this.cbPanel = null;
  },

  isCbPanelOpen() {
    return !!this.cbPanel;
  },

  toggleBreakpoint(line) {
    const {
      selectedSource,
      selectedLocation,
      breakpoints,
      addBreakpoint,
      removeBreakpoint
    } = this.props;
    const bp = breakpointAtLine(breakpoints, line);

    if ((bp && bp.loading) || !selectedLocation || !selectedSource) {
      return;
    }

    const { sourceId } = selectedLocation;

    if (bp) {
      removeBreakpoint({
        sourceId: sourceId,
        line: line + 1
      });
    } else {
      addBreakpoint(
        {
          sourceId: sourceId,
          sourceUrl: selectedSource.get("url"),
          line: line + 1
        },
        // Pass in a function to get line text because the breakpoint
        // may slide and it needs to compute the value at the new
        // line.
        { getTextForLine: l => getTextForLine(this.editor.codeMirror, l) }
      );
    }
  },

  toggleBreakpointDisabledStatus(line) {
    const bp = breakpointAtLine(this.props.breakpoints, line);
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
  },

  clearDebugLine(selectedFrame) {
    if (selectedFrame) {
      const line = selectedFrame.location.line;
      this.editor.codeMirror.removeLineClass(line - 1, "line", "debug-line");
    }
  },

  setDebugLine(selectedFrame, selectedLocation) {
    if (
      selectedFrame &&
      selectedLocation &&
      selectedFrame.location.sourceId === selectedLocation.sourceId
    ) {
      const line = selectedFrame.location.line;
      this.editor.codeMirror.addLineClass(line - 1, "line", "debug-line");
    }
  },

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
  },

  setText(text) {
    if (!text || !this.editor) {
      return;
    }

    this.editor.setText(text);
  },

  showMessage(msg) {
    this.editor.replaceDocument(this.editor.createDocument());
    this.setText(msg);
    this.editor.setMode({ name: "text" });
  },

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
  },

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

    return breakpoints.valueSeq().map(bp =>
      Breakpoint({
        key: makeLocationId(bp.location),
        breakpoint: bp,
        editor: this.editor && this.editor.codeMirror
      }));
  },

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
      }));
  },

  editorHeight() {
    const { selectedSource, horizontal } = this.props;

    if (!shouldShowFooter(selectedSource, horizontal)) {
      return "100%";
    }

    return "";
  },

  renderPreview() {
    const { selectedToken, selectedExpression } = this.state;
    const { selectedFrame, sourceText } = this.props;

    if (!this.editor || !sourceText) {
      return null;
    }

    if (
      !isEnabled("editorPreview") ||
      !selectedToken ||
      !selectedFrame ||
      !selectedExpression
    ) {
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
  },

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
        style: { height: this.editorHeight() }
      }),
      this.renderBreakpoints(),
      this.renderHitCounts(),
      Footer({ editor: this.editor, horizontal }),
      this.renderPreview()
    );
  }
});

module.exports = connect(
  state => {
    const selectedLocation = getSelectedLocation(state);
    const sourceId = selectedLocation && selectedLocation.sourceId;
    const selectedSource = getSelectedSource(state);

    return {
      selectedLocation,
      selectedSource,
      sourceText: getSourceText(state, sourceId),
      loadedObjects: getLoadedObjects(state),
      breakpoints: getBreakpointsForSource(state, sourceId || ""),
      hitCount: getHitCountForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state),
      getExpression: getExpression.bind(null, state),
      pauseData: getPause(state),
      coverageOn: getCoverageEnabled(state),
      query: getFileSearchQueryState(state),
      searchModifiers: getFileSearchModifierState(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
