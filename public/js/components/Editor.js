"use strict";

const React = require("react");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const CodeMirror = require("codemirror");
const { DOM: dom, PropTypes } = React;
const { debugGlobal } = require("../util/debug");

const {
  getSourceText, getBreakpointsForSource,
  getSelectedSource, getSelectedFrame,
  makeLocationId
} = require("../selectors");
const actions = require("../actions");
const { alignLine, onWheel, resizeBreakpointGutter } = require("../util/editor");
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
    selectedSource: ImPropTypes.map,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    selectedFrame: PropTypes.object
  },

  displayName: "Editor",

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

    debugGlobal("cm", this.editor);

    this.editor.on("gutterClick", this.onGutterClick);

    this.editor.getScrollerElement().addEventListener(
      "wheel",
      ev => onWheel(this.editor, ev)
    );

    resizeBreakpointGutter(this.editor);
  },

  onGutterClick(cm, line, gutter, ev) {
    const bp = this.props.breakpoints.find(b => {
      return b.getIn(["location", "line"]) === line + 1;
    });

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
    if (newSourceText.get("text") != this.editor.getValue()) {
      this.editor.setValue(newSourceText.get("text"));
    }

    resizeBreakpointGutter(this.editor);
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
      this.editor.setValue("");
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
      sourceText: getSourceText(state, selectedId),
      breakpoints: getBreakpointsForSource(state, selectedId),
      selectedFrame: getSelectedFrame(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
