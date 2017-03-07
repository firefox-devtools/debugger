// @flow
const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;

const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");

const { getMode } = require("../../utils/source");
const { getExpression } = require("../../utils/parser");

const Footer = createFactory(require("./Footer"));
const SearchBar = createFactory(require("./SearchBar"));
const GutterMenu = require("./GutterMenu");
const EditorMenu = require("./EditorMenu");
const Preview = createFactory(require("./Preview").default);
const { renderConditionalPanel } = require("./ConditionalPanel");
const { debugGlobal } = require("devtools-launchpad");
const { isEnabled } = require("devtools-config");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedLocation, getSelectedFrame,
  getSelectedSource, getHitCountForSource,
  getCoverageEnabled, getLoadedObjects
} = require("../../selectors");
const { makeLocationId } = require("../../reducers/breakpoints");
const actions = require("../../actions");
const Breakpoint = React.createFactory(require("./Breakpoint"));
const HitMarker = React.createFactory(require("./HitMarker"));

import type { Location } from "../../types";

const {
  getDocument,
  setDocument,
  shouldShowFooter,
  clearLineClass,
  onKeyDown,
  createEditor,
  isTextForSource,
  breakpointAtLine,
  getTextForLine,
  getCursorLine,
  getTokenLocation,
  resizeBreakpointGutter,
  traverseResults
} = require("../../utils/editor");
const { isFirefox } = require("devtools-config");

require("./Editor.css");

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    hitCount: PropTypes.object,
    selectedLocation: PropTypes.object.isRequired,
    selectedSource: ImPropTypes.map,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func.isRequired,
    disableBreakpoint: PropTypes.func.isRequired,
    enableBreakpoint: PropTypes.func.isRequired,
    removeBreakpoint: PropTypes.func.isRequired,
    setBreakpointCondition: PropTypes.func.isRequired,
    selectSource: PropTypes.func,
    jumpToMappedLocation: PropTypes.func,
    showSource: PropTypes.func,
    coverageOn: PropTypes.bool,
    selectedFrame: PropTypes.object,
    addExpression: PropTypes.func,
    horizontal: PropTypes.bool
  },

  cbPanel: (null : any),
  editor: (null : any),
  pendingJumpLine: (null : any),
  lastJumpLine: (null : any),

  displayName: "Editor",

  getInitialState() {
    return {
      query: "",
      searchResults: {
        index: -1,
        count: 0
      },
      selectedToken: null,
      previewExpression: null,
      searchModifiers: {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      },
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
      this.showMessage(sourceText.get("error") ||
        L10N.getStr("loadingText"));
    } else if (this.props.sourceText !== sourceText) {
      this.showSourceText(sourceText, selectedLocation);
    }

    this.setDebugLine(nextProps.selectedFrame, selectedLocation);
    resizeBreakpointGutter(this.editor.codeMirror);
  },

  componentDidMount() {
    this.cbPanel = null;

    this.editor = createEditor();

    // disables the default search shortcuts
    this.editor._initShortcuts = () => {};

    this.editor.appendToLocalElement(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount")
    );

    const codeMirror = this.editor.codeMirror;
    const codeMirrorWrapper = codeMirror.getWrapperElement();

    codeMirror.on("gutterClick", this.onGutterClick);

    // Set code editor wrapper to be focusable
    codeMirrorWrapper.tabIndex = 0;
    codeMirrorWrapper
      .addEventListener("keydown", e => onKeyDown(codeMirror, e));

    const ctx = { ed: this.editor, cm: codeMirror };
    const { query, searchModifiers } = this.state;

    codeMirrorWrapper
      .addEventListener("mouseup", e => this.onMouseUp(
        e, ctx, searchModifiers
      ));

    codeMirrorWrapper
      .addEventListener("mouseover", e => this.onMouseOver(
        e, ctx, searchModifiers
      ));

    if (!isFirefox()) {
      codeMirror.on(
        "gutterContextMenu",
        (cm, line, eventName, event) => this.onGutterContextMenu(event)
      );

      codeMirror.on(
        "contextmenu",
        (cm, event) => this.openMenu(event, cm)
      );
    } else {
      codeMirrorWrapper.addEventListener(
        "contextmenu",
        event => this.openMenu(event, codeMirror)
      );
    }

    codeMirror.on("scroll", this.onScroll);

    const shortcuts = this.context.shortcuts;

    shortcuts.on("CmdOrCtrl+B", (key, e) => {
      e.preventDefault();
      this.toggleBreakpoint(
        getCursorLine(codeMirror)
      );
    });

    shortcuts.on("CmdOrCtrl+Shift+B", (key, e) => {
      e.preventDefault();
      this.toggleConditionalPanel(
        getCursorLine(codeMirror)
      );
    });
    // The default Esc command is overridden in the CodeMirror keymap to allow
    // the Esc keypress event to be catched by the toolbox and trigger the
    // split console. Restore it here, but preventDefault if and only if there
    // is a multiselection.
    shortcuts.on("Esc", (key, e) => {
      if (codeMirror.listSelections().length > 1) {
        codeMirror.execCommand("singleSelection");
        e.preventDefault();
      }
    });

    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    shortcuts.on(`CmdOrCtrl+Shift+${searchAgainKey}`,
      (_, e) => traverseResults(e, ctx, query, "prev", searchModifiers));
    shortcuts.on(`CmdOrCtrl+${searchAgainKey}`,
      (_, e) => traverseResults(e, ctx, query, "next", searchModifiers));

    resizeBreakpointGutter(codeMirror);
    debugGlobal("cm", codeMirror);

    if (this.props.selectedSource) {
      let sourceId = this.props.selectedSource.get("id");
      const doc = getDocument(sourceId) || this.editor.createDocument();
      this.editor.replaceDocument(doc);
    } else if (this.props.sourceText) {
      this.setText(this.props.sourceText.get("text"));
    }
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
      if (selectedLocation &&
          selectedLocation.line != undefined) {
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

  onScroll(e) {
    return this.setState({ selectedToken: null });
  },

  onMouseUp(e, ctx, modifiers) {
    if (e.metaKey) {
      this.previewSelectedToken(e, ctx, modifiers);
    }
  },

  onMouseOver(e, ctx, modifiers) {
    this.previewSelectedToken(e, ctx, modifiers);
  },

  previewSelectedToken(e, ctx, modifiers) {
    const { selectedFrame, sourceText } = this.props;
    const { selectedToken } = this.state;
    const token = e.target;

    if (!selectedFrame || !isEnabled("editorPreview")) {
      return;
    }

    if (selectedToken) {
      selectedToken.classList.remove("selected-token");
    }

    const loc = getTokenLocation(token, ctx.cm);

    const variables = selectedFrame.scope.bindings.variables;
    const expression = getExpression(sourceText.toJS(), token.innerText, loc);

    if (!variables.hasOwnProperty(token.innerText) && !expression) {
      this.setState({
        selectedToken: null,
        previewExpression: null
      });
      return;
    }

    this.setState({
      selectedToken: token,
      previewExpression: expression
    });
  },

  openMenu(event, codeMirror) {
    return EditorMenu({
      codeMirror,
      event,
      selectedLocation: this.props.selectedLocation,
      selectedSource: this.props.selectedSource,
      showSource: this.props.showSource,
      onGutterContextMenu: this.onGutterContextMenu,
      jumpToMappedLocation: this.props.jumpToMappedLocation,
      addExpression: this.props.addExpression
    });
  },

  toggleModifier(searchModifiers) {
    this.setState({ searchModifiers });
  },

  updateQuery(query) {
    if (this.state.query == "" && query == "") {
      return;
    }

    this.setState({ query });
  },

  updateSearchResults({ count, index }) {
    this.setState({ searchResults: { count, index }});
  },

  onGutterClick(cm, line, gutter, ev) {
    // ignore right clicks in the gutter
    if (ev.which === 3) {
      return;
    }

    if (this.isCbPanelOpen()) {
      return this.closeConditionalPanel(line);
    }

    this.toggleBreakpoint(line);
  },

  onGutterContextMenu(event) {
    const line = this.editor.codeMirror.lineAtHeight(event.clientY);
    const bp = breakpointAtLine(this.props.breakpoints, line);
    GutterMenu({ event, line, bp,
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

    const { selectedLocation: { sourceId },
            setBreakpointCondition, breakpoints } = this.props;

    const bp = breakpointAtLine(breakpoints, line);
    const location = { sourceId, line: line + 1 };
    const condition = bp ? bp.condition : "";

    const setBreakpoint = value => setBreakpointCondition(location, {
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
    const bp = breakpointAtLine(this.props.breakpoints, line);

    if (bp && bp.loading) {
      return;
    }

    if (bp) {
      this.props.removeBreakpoint({
        sourceId: this.props.selectedLocation.sourceId,
        line: line + 1
      });
    } else {
      this.props.addBreakpoint(
        { sourceId: this.props.selectedLocation.sourceId,
          line: line + 1 },
        // Pass in a function to get line text because the breakpoint
        // may slide and it needs to compute the value at the new
        // line.
        { getTextForLine: l => getTextForLine(this.editor.codeMirror, l) }
      );
    }
  },

  toggleBreakpointDisabledStatus(line) {
    const bp = breakpointAtLine(this.props.breakpoints, line);

    if (bp && bp.loading) {
      return;
    }

    if (!bp) {
      throw new Error("attempt to disable breakpoint that does not exist");
    }

    if (!bp.disabled) {
      this.props.disableBreakpoint({
        sourceId: this.props.selectedLocation.sourceId,
        line: line + 1
      });
    } else {
      this.props.enableBreakpoint({
        sourceId: this.props.selectedLocation.sourceId,
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
    if (selectedFrame && selectedLocation &&
        selectedFrame.location.sourceId === selectedLocation.sourceId) {
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
    if (!this.props.selectedFrame ||
        this.props.selectedFrame.location.line !== line) {
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
    const { breakpoints, sourceText } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    if (isLoading) {
      return;
    }

    return breakpoints
      .valueSeq()
      .map(bp => Breakpoint({
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

    return hitCount
      .filter(marker => marker.get("count") > 0)
      .map(marker => HitMarker({
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
    const { selectedToken, previewExpression } = this.state;
    const { selectedFrame, sourceText } = this.props;

    if (!selectedToken || !selectedFrame || !isEnabled("editorPreview")) {
      return;
    }

    const token = selectedToken.innerText;
    const variables = selectedFrame.scope.bindings.variables;

    if (!variables.hasOwnProperty(token) && !previewExpression) {
      return;
    }

    selectedToken.classList.add("selected-token");
    let value = "";

    if (variables.hasOwnProperty(token)) {
      value = variables[token].value;
    }

    if (previewExpression) {
      value = previewExpression.value;
    }

    return Preview({
      value,
      expression: token,
      popoverTarget: selectedToken,
      onClose: () => {
        selectedToken.classList.remove("selected-token");
        this.setState({
          selectedToken: null,
          selectedTokenLocation: null
        });
      }
    });
  },

  render() {
    const {
      sourceText, selectSource, selectedSource, coverageOn, horizontal
    } = this.props;

    const { searchResults } = this.state;

    return (
      dom.div(
        {
          className: classnames(
            "editor-wrapper",
            { "coverage-on": coverageOn }
          )
        },
        SearchBar({
          editor: this.editor,
          selectSource,
          selectedSource,
          sourceText,
          searchResults,
          modifiers: this.state.searchModifiers,
          toggleModifier: this.toggleModifier,
          query: this.state.query,
          updateQuery: this.updateQuery,
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
      )
    );
  }
});

module.exports = connect(state => {
  const selectedLocation: ?Location = getSelectedLocation(state);
  const sourceId: ?string = selectedLocation && selectedLocation.sourceId;
  const selectedSource = getSelectedSource(state);

  return {
    selectedLocation,
    selectedSource,
    sourceText: getSourceText(state, sourceId),
    loadedObjects: getLoadedObjects(state),
    breakpoints: getBreakpointsForSource(state, sourceId),
    hitCount: getHitCountForSource(state, sourceId),
    selectedFrame: getSelectedFrame(state),
    coverageOn: getCoverageEnabled(state)
  };
}, dispatch => bindActionCreators(actions, dispatch))(Editor);
