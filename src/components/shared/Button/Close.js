const React = require("react");
const { DOM: dom, PropTypes } = React;
const Svg = require("../Svg");

require("./Close.css");

function CloseButton({ handleClick, buttonClass, tooltip }) {
  return dom.div({
    className: buttonClass ? `close-btn-${buttonClass}` : "close-btn",
    onClick: handleClick,
    title: tooltip
  },
    Svg("close"));
}

CloseButton.propTypes = {
  handleClick: PropTypes.func.isRequired
};

module.exports = CloseButton;
