const React = require("react");
const { PropTypes } = React;
const classnames = require("classnames");

function makeMarker(isDisabled) {
  let marker = document.createElement("div");
  marker.className = classnames(
    "editor new-breakpoint",
    { "breakpoint-disabled": isDisabled }
  );

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 60 12");
  svg.setAttribute("preserveAspectRatio", "none");
  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // Until we figure out our loader story, embed it directly so we can
  // control it with CSS.
  path.setAttribute("d", "M53.9,0H1C0.4,0,0,0.4,0,1v10c0,0.6,0.4,1,1,1h52.9c0.6,0,1.2-0.3,1.5-0.7L60,6l-4.4-5.3C55,0.3,54.5,0,53.9,0z"); // eslint-disable-line max-len
  svg.appendChild(path);
  marker.appendChild(svg);

  return marker;
}

const Breakpoint = React.createClass({
  propTypes: {
    breakpoint: PropTypes.object,
    editor: PropTypes.object
  },

  displayName: "Breakpoint",

  addBreakpoint() {
    const bp = this.props.breakpoint;
    const line = bp.location.line - 1;
    this.props.editor.setGutterMarker(
      line,
      "breakpoints",
      makeMarker(bp.disabled)
    );
    this.props.editor.addLineClass(line, "line", "new-breakpoint");
  },

  shouldComponentUpdate(nextProps) {
    return this.props.editor !== nextProps.editor ||
      this.props.breakpoint.disabled !== nextProps.breakpoint.disabled;
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
  },

  render() {
    return null;
  }
});

module.exports = Breakpoint;
