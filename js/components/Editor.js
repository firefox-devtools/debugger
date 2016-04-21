"use strict";

const React = require("react");
const { DOM: dom, PropTypes } = React;
const ReactDOM = require("react-dom");

const {
  getSourceText, getPause, getBreakpointsForSource,
  getSelectedSource } = require("../queries");

const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const Isvg = React.createFactory(require("react-inlinesvg"));
const { alignLine } = require("../util/editor");

require("codemirror/lib/codemirror.css");
require("./Editor.css");
require("codemirror/mode/javascript/javascript");
require("../lib/codemirror.css");
const CodeMirror = require("codemirror");

function makeMarker() {
  let marker = document.createElement("div");
  marker.className = "editor breakpoint";
  ReactDOM.render(
    React.createElement(Isvg, {
      src: "js/components/images/breakpoint.svg#base-path___2142144446"
    }),
    marker
  );
  return marker;
}

const Editor = React.createClass({
  propTypes: {
    selectedSource: PropTypes.object,
    sourceText: PropTypes.object,
    addBreakpoint: PropTypes.func,
    pause: PropTypes.object
  },

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: "javascript",
      lineNumbers: true,
      lineWrapping: true,
      smartIndent: false,
      matchBrackets: true,
      styleActiveLine: true,
      readOnly: true,
      gutters: ["breakpoints"]
    });

    this.editor.on("gutterClick", this.onGutterClick);
  },

  onGutterClick(cm, line, gutter, ev) {
    this.props.addBreakpoint({
      actor: this.props.selectedSource.get("actor"),
      line: line + 1
    });
  },

  showBreakpointAtLine(line) {
    let info = this.editor.lineInfo(line);
    if (info.gutterMarkers && info.gutterMarkers.breakpoints) {
      return;
    }

    this.editor.setGutterMarker(line, "breakpoints", makeMarker());
  },

  clearDebugLine(pauseInfo) {
    if (!pauseInfo
        || pauseInfo.getIn(["why", "type"]) == "interrupted") {
      return;
    }

    const line = pauseInfo.getIn(["frame", "where", "line"]);
    this.editor.removeLineClass(line - 1, "line", "debug-line");
  },

  setDebugLine(pauseInfo) {
    if (!pauseInfo
        || pauseInfo.getIn(["why", "type"]) == "interrupted") {
      return;
    }

    const line = pauseInfo.getIn(["frame", "where", "line"]);
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
    this.setSourceText(nextProps.sourceText, this.props.sourceText);
    this.clearDebugLine(this.props.pause);
    this.setDebugLine(nextProps.pause);

    if (nextProps.breakpoints) {
      nextProps.breakpoints.forEach(bp => {
        this.showBreakpointAtLine(bp.getIn(["location", "line"]) - 1);
      });
    }
  },

  render() {
    return (
      dom.div({ className: "editor" },
        dom.textarea({
          ref: "editor",
          defaultValue: "..."
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
      sourceText: getSourceText(state, selectedActor),
      breakpoints: getBreakpointsForSource(state, selectedActor),
      pause: getPause(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
