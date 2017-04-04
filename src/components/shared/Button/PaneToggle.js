// @flow

import { DOM as dom, PropTypes, Component } from "react";
import classnames from "classnames";
import Svg from "../Svg";
import "./PaneToggle.css";

type NextProps = {
  collapsed: boolean,
  handleClick: () => any,
  horizontal?: boolean,
  position: string
};

class PaneToggleButton extends Component {
  shouldComponentUpdate(nextProps: NextProps) {
    const { collapsed, horizontal } = this.props;

    return horizontal !== nextProps.horizontal ||
      collapsed !== nextProps.collapsed;
  }

  render() {
    const { position, collapsed, horizontal, handleClick } = this.props;
    const title = !collapsed
      ? L10N.getStr("expandPanes")
      : L10N.getStr("collapsePanes");

    return dom.div(
      {
        className: classnames(`toggle-button-${position}`, {
          collapsed,
          vertical: horizontal != null ? !horizontal : false
        }),
        onClick: () => handleClick(position, collapsed),
        title
      },
      Svg("togglePanes")
    );
  }
}

PaneToggleButton.propTypes = {
  position: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
  horizontal: PropTypes.bool,
  handleClick: PropTypes.func.isRequired
};

PaneToggleButton.displayName = "PaneToggleButton";

export default PaneToggleButton;
