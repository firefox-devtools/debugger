/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React from "react";
import Svg from "../Svg";
import "./Close.css";

type Props = {
  handleClick: Function,
  buttonClass?: string,
  tooltip?: string,
  tabIndex?: string
};

function CloseButton({ handleClick, buttonClass, tooltip, tabIndex }: Props) {
  return (
    <button
      className={buttonClass ? `close-btn ${buttonClass}` : "close-btn"}
      onClick={handleClick}
      title={tooltip}
      tabIndex={tabIndex}
    >
      <Svg name="close" />
    </button>
  );
}

export default CloseButton;
