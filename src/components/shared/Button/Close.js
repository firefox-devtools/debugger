// @flow
import React from "react";
import Svg from "../Svg";
import "./Close.css";

type Props = {
  handleClick: Function,
  buttonClass?: string,
  tooltip?: string
};

function CloseButton({ handleClick, buttonClass, tooltip }: Props) {
  return (
    <div
      className={buttonClass ? `close-btn ${buttonClass}` : "close-btn"}
      onClick={handleClick}
      title={tooltip}
    >

    <img className="close" />
    </div>
  );
}

export default CloseButton;
