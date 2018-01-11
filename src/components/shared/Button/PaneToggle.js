/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import classnames from "classnames";
import Svg from "../Svg";
import CommandBarButton from "./CommandBarButton";
import "./PaneToggle.css";

type Props = {
  collapsed: boolean,
  handleClick: (string, boolean) => void,
  horizontal?: boolean,
  position: string
};

class PaneToggleButton extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    const { collapsed, horizontal, position } = this.props;
    const diffHorizontal = horizontal !== nextProps.horizontal;
    const diffCollapsed = collapsed !== nextProps.collapsed;
    const diffPosition = position !== nextProps.position;
    return diffHorizontal || diffCollapsed || diffPosition;
  }

  render() {
    const { position, collapsed, horizontal, handleClick } = this.props;
    const title = !collapsed
      ? L10N.getStr("expandPanes")
      : L10N.getStr("collapsePanes");

    return (
      <CommandBarButton
        className={classnames("toggle-button", position, {
          collapsed,
          vertical: horizontal != null ? !horizontal : false
        })}
        onClick={() => handleClick(position, collapsed)}
        title={title}
      >
        <Svg name="togglePanes" />
      </CommandBarButton>
    );
  }
}

export default PaneToggleButton;
