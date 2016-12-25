const React = require("react");
const classnames = require("classnames");
const Svg = require("./utils/Svg");

require("./PaneCollapseButton.css");

function PaneCollapseButton({ position, collapsed, horizontal, handleClick }) {
  return React.DOM.div({
    className: classnames(`toggle-button-${position}`, {
      collapsed, horizontal }),
    onClick: () => handleClick(position),
  }, Svg("togglePanes"));
}

module.exports = PaneCollapseButton;
