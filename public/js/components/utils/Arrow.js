const React = require("react");
const InlineSVG = require("svg-inline-react");
const { DOM: dom } = React;
require("./Arrow.css");

// This is inline because it's much faster. We need to revisit how we
// load SVGs, at least for components that render them several times.
let Arrow = props => {
  const className = "arrow " + (props.className || "");
  return dom.span(
    Object.assign({}, props, { className }),
    React.createElement(InlineSVG, {
      src: require("../../../images/arrow.svg")
    })
  );
};

module.exports = Arrow;
