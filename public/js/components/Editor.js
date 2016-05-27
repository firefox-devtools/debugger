"use strict";

const React = require("react");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const CodeMirror = require("codemirror");
const { DOM: dom, PropTypes } = React;

const {
  getSourceText, getBreakpointsForSource,
  getSelectedSource, getSelectedSourceOpts,
  getSelectedFrame, makeLocationId
} = require("../selectors");
const actions = require("../actions");
const { alignLine, onWheel } = require("../util/editor");
const Breakpoint = React.createFactory(require("./EditorBreakpoint"));

require("codemirror/lib/codemirror.css");
require("./Editor.css");
require("codemirror/mode/javascript/javascript");
require("../lib/codemirror.css");

function isSourceForFrame(source, frame) {
  return frame && frame.location.sourceId === source.get("id");
}

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    selectedSource: ImPropTypes.map.isRequired,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: "javascript",
      lineNumbers: true,
      lineWrapping: false,
      smartIndent: false,
      matchBrackets: true,
      styleActiveLine: true,
      readOnly: true,
      gutters: ["breakpoints"]
    });

    this.editor.on("gutterClick", this.onGutterClick);

    this.editor.getScrollerElement().addEventListener("wheel",
      ev => onWheel(this.editor, ev));
  },

  onGutterClick(cm, line, gutter, ev) {
    const bp = this.props.breakpoints.find(b => {
      return b.getIn(["location", "line"]) === line + 1;
    });

    const applyBp = bp ? this.props.removeBreakpoint : this.props.addBreakpoint;
    applyBp({
      sourceId: this.props.selectedSource.get("id"),
      line: line + 1,
      snippet: cm.lineInfo(line).text.trim()
    });
  },

  clearDebugLine(line) {
    this.editor.removeLineClass(line - 1, "line", "debug-line");
  },

  setDebugLine(line) {
    this.editor.addLineClass(line - 1, "line", "debug-line");
    alignLine(this.editor, line);
  },

  setSourceText(newSourceText, oldSourceText) {
    if (newSourceText.get("loading")) {
      this.editor.setValue("Loading...");
      return;
    }

    if (newSourceText.get("error")) {
      this.editor.setValue("Error");
      console.error(newSourceText.get("error"));
      return;
    }

    // Only reset the editor text if the source has changed.
    // + Resetting the text will remove the breakpoints.
    // + Comparing the source text is probably inneficient.
    if (!oldSourceText ||
        newSourceText.get("text") != oldSourceText.get("text")) {
      this.editor.setValue(newSourceText.get("text"));
    }
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

    // Highlight the paused line if necessary
    if (isSourceForFrame(nextProps.selectedSource, nextProps.selectedFrame)) {
      this.setDebugLine(nextProps.selectedFrame.location.line);
    }
  },

  render() {
    const breakpoints = this.props.breakpoints.valueSeq()
          .filter(bp => !bp.get("disabled"));

    return (
      dom.div(
        { className: "editor-wrapper" },
        dom.textarea({
          ref: "editor",
          defaultValue: "..."
        }),
        breakpoints.map(bp => {
          return Breakpoint({
            key: makeLocationId(bp.get("location").toJS()),
            breakpoint: bp,
            editor: this.editor
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
      selectedSource: selectedSource,
      selectedSourceOpts: getSelectedSourceOpts(state),
      sourceText: getSourceText(state, selectedId),
      breakpoints: getBreakpointsForSource(state, selectedId),
      selectedFrame: getSelectedFrame(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
