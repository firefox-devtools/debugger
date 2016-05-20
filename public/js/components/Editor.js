"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const CodeMirror = require("codemirror");
const { DOM: dom, PropTypes } = React;

const {
  getSourceText, getPause, getBreakpointsForSource,
  getSelectedSource, getSelectedSourceOpts,
  makeLocationId
} = require("../selectors");
const actions = require("../actions");
const { alignLine, onWheel } = require("../util/editor");
const Breakpoint = React.createFactory(require("./Editor/Breakpoint"));

require("codemirror/lib/codemirror.css");
require("./Editor.css");
require("codemirror/mode/javascript/javascript");
require("../lib/codemirror.css");

const Editor = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    selectedSource: PropTypes.object,
    selectedSourceOpts: PropTypes.object,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func,
    pause: PropTypes.object
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
      actor: this.props.selectedSource.get("actor"),
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
    // The source text may not have been loaded yet.
    // TODO(jwl): clear the existing state of the editor
    if (nextProps.sourceText) {
      this.setSourceText(nextProps.sourceText, this.props.sourceText);
    }

    let pause = this.props.pause;

    if (pause) {
      this.clearDebugLine(pause.getIn(["frame", "where", "line"]));
    }

    if (this.props.selectedSourceOpts &&
        this.props.selectedSourceOpts.get("line")) {
      this.clearDebugLine(this.props.selectedSourceOpts.get("line"));
    }

    if (nextProps.selectedSourceOpts &&
       nextProps.selectedSourceOpts.get("line")) {
      this.setDebugLine(nextProps.selectedSourceOpts.get("line"));
    } else if (nextProps.pause &&
               nextProps.pause.getIn(["why", "type"]) !== "interrupted") {
      this.setDebugLine(nextProps.pause.getIn(["frame", "where", "line"]));
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
    const selectedActor = selectedSource && selectedSource.get("actor");

    return {
      selectedSource: selectedSource,
      selectedSourceOpts: getSelectedSourceOpts(state),
      sourceText: getSourceText(state, selectedActor),
      breakpoints: getBreakpointsForSource(state, selectedActor),
      pause: getPause(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
