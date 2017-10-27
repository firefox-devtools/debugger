// @flow
import React, { Component } from "react";
import classnames from "classnames";
import Svg from "../Svg";
import "./PaneToggle.css";

type Props = {
  collapsed: boolean,
  handleClick: (string, boolean) => void,
  horizontal?: boolean,
  position: string
};

class PaneToggleButton extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    const { collapsed, horizontal } = this.props;

    return (
      horizontal !== nextProps.horizontal || collapsed !== nextProps.collapsed
    );
  }

  render() {
    const { position, collapsed, horizontal, handleClick } = this.props;
    const title = !collapsed
      ? L10N.getStr("expandPanes")
      : L10N.getStr("collapsePanes");

    return (
      <button
        className={classnames(`toggle-button-${position}`, {
          collapsed,
          vertical: horizontal != null ? !horizontal : false
        })}
        onClick={() => handleClick(position, collapsed)}
        title={title}
      >
        <Svg name="togglePanes" />
      </button>
    );
  }
}

export default PaneToggleButton;
