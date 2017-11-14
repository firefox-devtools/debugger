// @flow
import React from "react";
import Svg from "../Svg";
import "./Close.css";

type Props = {
  handleClick: Function,
  buttonClass?: string,
  tooltip?: string,
  tabIndex?: role
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
