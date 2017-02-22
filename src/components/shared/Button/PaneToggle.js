// @flow
const React = require("react");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const Svg = require("../Svg");

require("./PaneToggle.css");

type NextProps = {
  collapsed: boolean,
  handleClick: () => any,
  horizontal?: boolean,
  position: string
};

const PaneToggleButton = React.createClass({
  propTypes: {
    position: PropTypes.string.isRequired,
    collapsed: PropTypes.bool.isRequired,
    horizontal: PropTypes.bool,
    handleClick: PropTypes.func.isRequired
  },

  displayName: "PaneToggleButton",

  shouldComponentUpdate(nextProps: NextProps) {
    const { collapsed, horizontal } = this.props;

    return horizontal !== nextProps.horizontal
      || collapsed !== nextProps.collapsed;
  },

  render() {
    const { position, collapsed, horizontal, handleClick } = this.props;
    const title = !collapsed
      ? L10N.getStr("expandPanes")
      : L10N.getStr("collapsePanes");

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
