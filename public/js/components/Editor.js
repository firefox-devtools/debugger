const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;

const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const SourceEditor = require("../utils/source-editor");
const SourceFooter = createFactory(require("./SourceFooter"));
const EditorSearchBar = createFactory(require("./EditorSearchBar"));
const { debugGlobal } = require("devtools-local-toolbox");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedLocation, getSelectedFrame,
  getSelectedSource
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const actions = require("../actions");
const Breakpoint = React.createFactory(require("./EditorBreakpoint"));

const { getDocument, setDocument } = require("../utils/source-documents");
const { shouldShowFooter } = require("../utils/editor");
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

function renderConditionalBreakpointPanel(
  { location, setBreakpointCondition, condition, closePanel }) {
  function onKey(e) {
    if (e.key != "Enter") {
      return;
    }

    setBreakpointCondition(location, e.target.value);
    closePanel();
  }

  let panel = document.createElement("div");
  ReactDOM.render(
    dom.div(
      { className: "conditional-breakpoint-panel" },
      dom.input({
        defaultValue: condition,
        placeholder: "This breakpoint will pause when the expression is true",
        onKeyPress: onKey
      })
    ),
    panel
  );

  return panel;
}

/**
 * Forces the breakpoint gutter to be the same size as the line
 * numbers gutter. Editor CSS will absolutely position the gutter
 * beneath the line numbers. This makes it easy to be flexible with
 * how we overlay breakpoints.
 */
function resizeBreakpointGutter(editor) {
  const gutters = editor.display.gutters;
  const lineNumbers = gutters.querySelector(".CodeMirror-linenumbers");
  const breakpoints = gutters.querySelector(".breakpoints");
  breakpoints.style.width = lineNumbers.clientWidth + "px";
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
    const bp = breakpointAtLine(this.props.breakpoints, line);
    const { selectedLocation: { sourceId },
            setBreakpointCondition } = this.props;

    const location = { sourceId, line: line + 1 };
    const closePanel = () => this.cbPanels[line].clear();

    if (isEnabled("conditionalBreakpoints") && bp && ev.metaKey) {
      if (!this.state.isCondBPOpen) {
        const { condition } = bp;
        const panel = renderConditionalBreakpointPanel({
          location, setBreakpointCondition, condition, closePanel
        });

        this.cbPanels[line] = this.editor.codeMirror.addLineWidget(line, panel);
        this.setState({ isCondBPOpen: true, openPanel: this.cbPanels[line] });
      } else {
        delete this.cbPanels[line];
        this.state.openPanel.clear();
        this.replaceState({ isCondBPOpen: false });
      }
      return;
    }

    this.toggleBreakpoint(bp, line);
  },

  toggleBreakpoint(bp, line) {
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
        { getTextForLine: l => this.editor.codeMirror.getLine(l - 1).trim() }
      );
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

  highlightLine() {
    if (!this.pendingJumpLine) {
      return;
    }

    // If the location has changed and a specific line is requested,
    // move to that line and flash it.
    const codeMirror = this.editor.codeMirror;

    // Make sure to clean up after ourselves. Not only does this
    // cancel any existing animation, but it avoids it from
    // happening ever again (in case CodeMirror re-applies the
    // class, etc).
    if (this.lastJumpLine) {
      codeMirror.removeLineClass(
        this.lastJumpLine - 1, "line", "highlight-line"
      );
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

  setMode(sourceText) {
    const contentType = sourceText.get("contentType");

    if (contentType.includes("javascript")) {
      this.editor.setMode({ name: "javascript" });
    } else if (contentType === "text/wasm") {
      this.editor.setMode({ name: "text" });
    } else if (sourceText.get("text").match(/^\s*</)) {
      // Use HTML mode for files in which the first non whitespace
      // character is `<` regardless of extension.
      this.editor.setMode({ name: "htmlmixed" });
    } else {
      this.editor.setMode({ name: "text" });
    }
  },

  getInitialState() {
    return { isCondBPOpen: false };
  },

  componentDidMount() {
    const extraKeys = isEnabled("search") ? { "Cmd-F": () => {} } : {};
    this.cbPanels = {};

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
      extraKeys
    });

    this.editor.appendToLocalElement(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount")
    );

    this.editor.codeMirror.on("gutterClick", this.onGutterClick);
    resizeBreakpointGutter(this.editor.codeMirror);
    debugGlobal("cm", this.editor.codeMirror);

    if (this.props.sourceText) {
      this.setText(this.props.sourceText.get("text"));
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
    this.clearDebugLine(this.props.selectedFrame);

    if (!sourceText) {
      this.showMessage("");
    } else if (!isTextForSource(sourceText)) {
      this.showMessage(sourceText.get("error") || "Loading...");
    } else if (this.props.sourceText !== sourceText) {
      this.showSourceText(sourceText, selectedLocation);
    }

    this.setDebugLine(nextProps.selectedFrame, selectedLocation);
    resizeBreakpointGutter(this.editor.codeMirror);
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
    this.setMode(sourceText);
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

  editorHeight() {
    const { selectedSource } = this.props;

    if (!selectedSource || !shouldShowFooter(selectedSource.toJS())) {
      return "100%";
    }

    return "";
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
          style: { height: this.editorHeight() }
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
