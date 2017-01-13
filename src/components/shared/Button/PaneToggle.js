const React = require("react");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const Svg = require("../Svg");

require("./PaneToggle.css");

const PaneToggleButton = React.createClass({
  propTypes: {
    position: PropTypes.string.isRequired,
    collapsed: PropTypes.bool.isRequired,
    horizontal: PropTypes.bool,
    handleClick: PropTypes.func.isRequired
  },

  displayName: "PaneToggleButton",

  shouldComponentUpdate(nextProps, nextState) {
    const { collapsed, horizontal } = this.props;

    if (collapsed !== nextProps.collapsed) {
      return true;
    }

    if (horizontal !== nextProps.horizontal) {
      return true;
    }

    return false;
  },

  render() {
    const { position, collapsed, horizontal, handleClick } = this.props;
    const title = !collapsed ? L10N.getStr("expandPanes") : L10N.getStr("collapsePanes");

    return dom.div({
      className: classnames(`toggle-button-${position}`, {
        collapsed,
        vertical: horizontal != null ? !horizontal : false
      }),
      onClick: () => handleClick(position, collapsed),
      title
    }, Svg("togglePanes"));
  }
});

module.exports = PaneToggleButton;
