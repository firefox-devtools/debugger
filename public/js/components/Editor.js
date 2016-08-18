const React = require("react");
const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const SourceEditor = require("../utils/source-editor");
const { debugGlobal } = require("../utils/debug");
const {
  getSourceText, getBreakpointsForSource,
  getSelectedSource, getSelectedFrame
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const actions = require("../actions");
const Breakpoint = React.createFactory(require("./EditorBreakpoint"));
const { DOM: dom, PropTypes } = React;

require("./Editor.css");

function isSourceForFrame(source, frame) {
  return frame && frame.location.sourceId === source.get("id");
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
    selectedSource: ImPropTypes.map,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Editor",

  componentDidMount() {
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
      value: " "
    });

    this.editor.appendTo(
      ReactDOM.findDOMNode(this).querySelector(".editor-mount"),
      null,
      true
    );

    this.editor.codeMirror.on("gutterClick", this.onGutterClick);
    this.setText(this.props.sourceText.get("text"));
    resizeBreakpointGutter(this.editor.codeMirror);
    debugGlobal("cm", this.editor.codeMirror);
  },

  onGutterClick(cm, line, gutter, ev) {
    const bp = this.props.breakpoints.find(b => {
      return b.location.line === line + 1;
    });

    if (bp && bp.loading) {
      return;
    }

    if (bp) {
      this.props.removeBreakpoint({
        sourceId: this.props.selectedSource.get("id"),
        line: line + 1
      });
    } else {
      this.props.addBreakpoint(
        { sourceId: this.props.selectedSource.get("id"),
          line: line + 1 },
        // Pass in a function to get line text because the breakpoint
        // may slide and it needs to compute the value at the new
        // line.
        { getTextForLine: l => cm.getLine(l - 1).trim() }
      );
    }
  },

  clearDebugLine(line) {
    this.editor.codeMirror.removeLineClass(line - 1, "line", "debug-line");
  },

  setDebugLine(line) {
    this.editor.codeMirror.addLineClass(line - 1, "line", "debug-line");
    this.editor.alignLine(line);
  },

  setSourceText(newSourceText, oldSourceText) {
    if (newSourceText.get("loading")) {
      this.setText("Loading...");
      return;
    }

    if (newSourceText.get("error")) {
      this.setText("Error");
      console.error(newSourceText.get("error"));
      return;
    }

    this.setText(newSourceText.get("text"));

    resizeBreakpointGutter(this.editor.codeMirror);
  },

  // Only reset the editor text if the source has changed.
  // * Resetting the text will remove the breakpoints.
  // * Comparing the source text is probably inneficient.
  setText(text) {
    if (!text || !this.editor) {
      return;
    }

    if (text == this.editor.getText()) {
      return;
    }

    this.editor.setText(text);
  },

  componentWillReceiveProps(nextProps) {
    // Clear the currently highlighted line
    if (isSourceForFrame(this.props.selectedSource, this.props.selectedFrame)) {
      this.clearDebugLine(this.props.selectedFrame.location.line);
    }

    // Set the source text. The source text may not have been loaded
    // yet. On startup, the source text may not exist yet.
    if (nextProps.sourceText) {
      this.setSourceText(nextProps.sourceText, this.props.sourceText);
    }

    if (this.props.selectedSource && !nextProps.selectedSource) {
      this.editor.setText("");
    }

    // Highlight the paused line if necessary
    if (isSourceForFrame(nextProps.selectedSource, nextProps.selectedFrame)) {
      this.setDebugLine(nextProps.selectedFrame.location.line);
    }
  },

  render() {
    const breakpoints = this.props.breakpoints.valueSeq()
          .filter(bp => !bp.disabled);

    return (
      dom.div(
        { className: "editor-wrapper devtools-monospace" },
        dom.div({ className: "editor-mount" }),
        breakpoints.map(bp => {
          return Breakpoint({
            key: makeLocationId(bp.location),
            breakpoint: bp,
            editor: this.editor && this.editor.codeMirror
          });
        })
      )
    );
  }
});

module.exports = connect(
  (state, props) => {
    const selectedSource = getSelectedSource(state);
    const selectedId = selectedSource && selectedSource.get("id");

    return {
      selectedSource,
      sourceText: getSourceText(state, selectedId),
      breakpoints: getBreakpointsForSource(state, selectedId),
      selectedFrame: getSelectedFrame(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
