const React = require("react");
const ReactDOM = require("react-dom");
const ImPropTypes = require("react-immutable-proptypes");
const { PropTypes } = React;
const Isvg = React.createFactory(require("react-inlinesvg"));


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

const Breakpoint = React.createClass({
  propTypes: {
    breakpoint: ImPropTypes.map,
    editor: PropTypes.object
  },

  displayName: "Breakpoint",

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

module.exports = Breakpoint;
