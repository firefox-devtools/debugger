const React = require("react");
const { DOM: dom, PropTypes } = React;
const Svg = require("./utils/Svg");

require("./CloseButton.css");

function CloseButton({ handleClick, buttonClass }) {
  return dom.div({ className: buttonClass !== undefined ? buttonClass : "close-btn", onClick: handleClick },
    Svg("close"));
}

CloseButton.propTypes = {
  handleClick: PropTypes.func.isRequired
};

module.exports = CloseButton;
