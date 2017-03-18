// @flow
const React = require("react");
const ReactDOM = require("react-dom");

const { PropTypes } = React;
const classnames = require("classnames");
const Svg = require("../shared/Svg");

const breakpointSvg = document.createElement("div");
ReactDOM.render(Svg("breakpoint"), breakpointSvg);

function makeMarker(isDisabled: boolean) {
  const bp = breakpointSvg.cloneNode(true);
  bp.className = classnames("editor new-breakpoint", {
    "breakpoint-disabled": isDisabled,
  });

  return bp;
}

const Breakpoint = React.createClass({
  propTypes: {
    breakpoint: PropTypes.object.isRequired,
    editor: PropTypes.object.isRequired,
  },

  displayName: "Breakpoint",

  addBreakpoint() {
    const bp = this.props.breakpoint;
    const line = bp.location.line - 1;

    this.props.editor.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(bp.disabled),
    );
    this.props.editor.addLineClass(line, "line", "new-breakpoint");
    if (bp.condition) {
      this.props.editor.addLineClass(line, "line", "has-condition");
    } else {
      this.props.editor.removeLineClass(line, "line", "has-condition");
    }
  },

  shouldComponentUpdate(nextProps: any) {
    return this.props.editor !== nextProps.editor ||
      this.props.breakpoint.disabled !== nextProps.breakpoint.disabled ||
      this.props.breakpoint.condition !== nextProps.breakpoint.condition;
  },

  componentDidMount() {
    if (!this.props.editor) {
      return;
    }

    this.addBreakpoint();
  },

  componentDidUpdate() {
    this.addBreakpoint();
  },

  componentWillUnmount() {
    if (!this.props.editor) {
      return;
    }

    const bp = this.props.breakpoint;
    const line = bp.location.line - 1;

    this.props.editor.setGutterMarker(line, "breakpoints", null);
    this.props.editor.removeLineClass(line, "line", "new-breakpoint");
    this.props.editor.removeLineClass(line, "line", "has-condition");
  },

  render() {
    return null;
  },
});

module.exports = Breakpoint;
