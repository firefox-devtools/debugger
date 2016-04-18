"use strict";

const React = require("react");
const { DOM: dom, PropTypes } = React;
const ReactDOM = require("react-dom");

const { getSourceText } = require("../queries");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const Isvg = React.createFactory(require("react-inlinesvg"));

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
    addBreakpoint: PropTypes.func
  },

  componentDidMount() {
    this.editor = CodeMirror.fromTextArea(this.refs.editor, {
      mode: "javascript",
      lineNumbers: true,
      lineWrapping: true,
      smartIndent: false,
      matchBrackets: true,
      readOnly: true,
      gutters: ["breakpoints"]
    });

    this.editor.on("gutterClick", this.onGutterClick);
  },

  onGutterClick(cm, line, gutter, ev) {
    let info = cm.lineInfo(line);
    cm.setGutterMarker(
      line,
      "breakpoints",
      info.gutterMarkers ? null : makeMarker()
    );

    this.props.addBreakpoint({
      actor: this.props.selectedSource.get("actor"),
      line: line + 1
    });
  },

  componentWillReceiveProps(nextProps) {
    const sourceText = nextProps.sourceText;
    const cursor = this.editor.getCursor();

    if (sourceText.get("loading")) {
      this.editor.setValue("Loading...");
      return;
    }

    if (sourceText.get("error")) {
      this.editor.setValue("Error");
      console.error(sourceText.get("error"));
      return;
    }

    this.editor.setValue(sourceText.get("text"));
    this.editor.setCursor(cursor);
  },

  render() {
    return (
      dom.div(
        { className: "editor" },
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
    const selectedActor = props.selectedSource
                          && props.selectedSource.get("actor");
    return { sourceText: getSourceText(state, selectedActor) };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Editor);
