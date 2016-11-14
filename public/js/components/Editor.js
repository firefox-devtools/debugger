const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;

const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const SourceEditor = require("../utils/source-editor");
const SourceFooter = createFactory(require("./SourceFooter"));
const EditorSearchBar = createFactory(require("./EditorSearchBar"));
const { renderConditionalPanel } = require("./EditorConditionalPanel");
const { debugGlobal } = require("devtools-local-toolbox");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedLocation, getSelectedFrame,
  getSelectedSource
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const actions = require("../actions");
const Breakpoint = React.createFactory(require("./EditorBreakpoint"));

const { shouldShowFooter, setText, setMode, editorHeight, highlightLine,
        showSourceText, resizeBreakpointGutter,
        clearDebugLine, setDebugLine } = require("../utils/editor");
const { isFirefox } = require("devtools-config");
const { showMenu } = require("../utils/menu");
const { isEnabled } = require("devtools-config");

require("./Editor.css");

function isTextForSource(sourceText) {
  return !sourceText.get("loading") && !sourceText.get("error");
}

function breakpointAtLine(breakpoints, line) {
  return breakpoints.find(b => {
    return b.location.line === line + 1;
  });
}

function getTextForLine(codeMirror, line) {
  return codeMirror.getLine(line - 1).trim();
}

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    selectedLocation: PropTypes.object,
    selectedSource: ImPropTypes.map,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    setBreakpointCondition: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Editor",

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
    event.preventDefault();
    const line = this.editor.codeMirror.lineAtHeight(event.clientY);
    const bp = breakpointAtLine(this.props.breakpoints, line);
    this.showGutterMenu(event, line, bp);
  },

  showConditionalPanel(line) {
    if (this.isCbPanelOpen()) {
      return;
    }

    const { selectedLocation: { sourceId },
            setBreakpointCondition, breakpoints } = this.props;

    const bp = breakpointAtLine(breakpoints, line);
    const location = { sourceId, line: line + 1 };
    const condition = bp ? bp.condition : "";

    const setBreakpoint = value => {
      setBreakpointCondition(location, {
        condition: value,
        getTextForLine: l => getTextForLine(this.editor.codeMirror, l)
      });
    };

    const panel = renderConditionalPanel({
      condition,
      setBreakpoint,
      closePanel: this.closeConditionalPanel
    });

    this.cbPanel = this.editor.codeMirror.addLineWidget(line, panel);
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

  showGutterMenu(e, line, bp) {
    let bpLabel;
    let cbLabel;
    if (!bp) {
      bpLabel = L10N.getStr("editor.addBreakpoint");
      cbLabel = L10N.getStr("editor.addConditionalBreakpoint");
    } else {
      bpLabel = L10N.getStr("editor.removeBreakpoint");
      cbLabel = L10N.getStr("editor.editBreakpoint");
    }

    const toggleBreakpoint = {
      id: "node-menu-breakpoint",
      label: bpLabel,
      accesskey: "B",
      disabled: false,
      click: () => {
        this.toggleBreakpoint(line);
        if (this.isCbPanelOpen()) {
          this.closeConditionalPanel();
        }
      }
    };

    const conditionalBreakpoint = {
      id: "node-menu-conditional-breakpoint",
      label: cbLabel,
      accesskey: "C",
      disabled: false,
      click: () => this.showConditionalPanel(line)
    };

    showMenu(e, [
      toggleBreakpoint,
      conditionalBreakpoint
    ]);
  },

  componentDidMount() {
    this.cbPanel = null;

    this.editor = new SourceEditor({
      mode: "javascript",
      readOnly: true,
      lineNumbers: true,
      theme: "mozilla",
      lineWrapping: false,
      matchBrackets: true,
      showAnnotationRuler: true,
      enableCodeFolding: false,
      gutters: ["breakpoints"],
      value: " ",
      extraKeys: {}
    });

    // disables the default search shortcuts
    if (isEnabled("editorSearch")) {
      this.editor._initShortcuts = () => {};
    }

    this.editor.appendToLocalElement(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount")
    );

    this.editor.codeMirror.on("gutterClick", this.onGutterClick);

    if (!isFirefox()) {
      this.editor.codeMirror.on(
        "gutterContextMenu",
        (cm, line, eventName, event) => this.onGutterContextMenu(event)
      );
    } else {
      this.editor.codeMirror.getWrapperElement().addEventListener(
        "contextmenu",
        event => this.onGutterContextMenu(event),
        false
      );
    }

    resizeBreakpointGutter(this.editor.codeMirror);
    debugGlobal("cm", this.editor.codeMirror);

    if (this.props.sourceText) {
      setText(this.editor, this.props.sourceText.get("text"));
    }
  },

  componentWillUnmount() {
    this.editor.destroy();
    this.editor = null;
  },

  componentWillReceiveProps(nextProps) {
    // This lifecycle method is responsible for updating the editor
    // text.
    const { sourceText, selectedLocation } = nextProps;
    clearDebugLine(this.editor, this.props.selectedFrame);

    if (!sourceText) {
      showMessage(this.editor, "");
    } else if (!isTextForSource(sourceText)) {
      showMessage(this.editor, sourceText.get("error") || "Loading...");
    } else if (this.props.sourceText !== sourceText) {
      showSourceText(editor, sourceText, selectedLocation);
    }

    setDebugLine(this.editor, nextProps.selectedFrame, selectedLocation);
    resizeBreakpointGutter(this.editor.codeMirror);
  },

  componentDidUpdate(prevProps) {
    updatePendingJumpLine();

    // Only update and jump around in real source texts. This will
    // keep the jump state around until the real source text is
    // loaded.
    if (this.props.sourceText && isTextForSource(this.props.sourceText)) {
      highlightLine(this.editor);
    }
  },

  renderBreakpoints() {
    const { breakpoints, sourceText } = this.props;
    const isLoading = sourceText && sourceText.get("loading");

    if (isLoading) {
      return;
    }

    return breakpoints.valueSeq().map(bp => {
      return Breakpoint({
        key: makeLocationId(bp.location),
        breakpoint: bp,
        editor: this.editor && this.editor.codeMirror
      });
    });
  },

  render() {
    const { sourceText } = this.props;

    return (
      dom.div(
        { className: "editor-wrapper devtools-monospace" },
        EditorSearchBar({
          editor: this.editor,
          sourceText
        }),
        dom.div({
          className: "editor-mount",
          style: { height: editorHeight(this.editor) }
        }),
        this.renderBreakpoints(),
        SourceFooter({ editor: this.editor })
      )
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
      breakpoints: getBreakpointsForSource(state, sourceId),
      selectedFrame: getSelectedFrame(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
