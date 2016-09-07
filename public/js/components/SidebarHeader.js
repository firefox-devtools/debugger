const React = require("react");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const Svg = require("./utils/Svg");

require("./SidebarHeader.css");

const SidebarHeader = React.createClass({
  propTypes: {
    side: PropTypes.oneOf(["left", "right"]),
    children: PropTypes.node,
    className: PropTypes.string,
  },

  getDefaultProps() {
    return { side: "left" };
  },

  displayName: "SidebarHeader",

  renderCollapseButton() {
    return dom.div({ className: `collapse-button-${this.props.side}` },
      Svg("pane-collapse"));
  },

  render() {
    return dom.div({
      className: classnames("sidebar-header", this.props.className)
    }, this.renderCollapseButton(), this.props.children);
  }
});

module.exports = SidebarHeader;
