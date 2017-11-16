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
    <button
      type="button"
      class="btn"
      alt="Close "
      className={buttonClass ? `close-btn ${buttonClass}` : "close-btn"}
      onClick={handleClick}
      title={tooltip}
    >
      <Svg name="close" />
    </button>
  );
}

export default CloseButton;
