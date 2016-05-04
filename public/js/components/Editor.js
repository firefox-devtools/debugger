"use strict";

const React = require("react");
const Isvg = React.createFactory(require("react-inlinesvg"));
const { DOM: dom, PropTypes } = React;
const ImPropTypes = require("react-immutable-proptypes");

const ReactDOM = require("react-dom");

const {
  getSourceText, getPause, getBreakpointsForSource,
  getSelectedSource, getSelectedSourceOpts
} = require("../selectors");

const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");

const actions = require("../actions");
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
      src: "images/breakpoint.svg#base-path___2142144446"
    }),
    marker
  );
  return marker;
}

const _Breakpoint = React.createClass({
  propTypes: {
    breakpoint: ImPropTypes.map,
    editor: PropTypes.object
  },

  componentWillMount: function() {
    const bp = this.props.breakpoint;
    const line = bp.getIn(["location", "line"]) - 1;

    this.props.editor.setGutterMarker(line, "breakpoints", makeMarker());
    this.props.editor.addLineClass(line, "line", "breakpoint");
  },

  componentWillUnmount: function() {
    const bp = this.props.breakpoint;
    const line = bp.getIn(["location", "line"]) - 1;

    this.props.editor.setGutterMarker(line, "breakpoints", null);
    this.props.editor.removeLineClass(line, "line", "breakpoint");
  },

  render: function() {
    return null;
  }
});
const Breakpoint = React.createFactory(_Breakpoint);

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
  },

  onGutterClick(cm, line, gutter, ev) {
    const bp = this.props.breakpoints.find(b => {
      return b.getIn(["location", "line"]) === line + 1;
    });

    const applyBp = bp ? this.props.removeBreakpoint : this.props.addBreakpoint;
    applyBp({
      actor: this.props.selectedSource.get("actor"),
      line: line + 1
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
    return (
      dom.div(
        { className: "editor-wrapper" },
        dom.textarea({
          ref: "editor",
          defaultValue: "..."
        }),
        this.props.breakpoints.filter(bp => !bp.get("disabled")).map(bp => {
          return Breakpoint({ breakpoint: bp,
                              editor: this.editor });
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
