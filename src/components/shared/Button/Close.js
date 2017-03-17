// @flow
import { DOM as dom, PropTypes } from "react";
import Svg from "../Svg";
import "./Close.css";

type CloseButtonType = {
  handleClick: any,
  buttonClass?: string,
  tooltip?: string
};

function CloseButton({ handleClick, buttonClass, tooltip }: CloseButtonType) {
  return dom.div({
    className: buttonClass ? `close-btn ${buttonClass}` : "close-btn",
    onClick: handleClick,
    title: tooltip
  },
    Svg("close"));
}

CloseButton.propTypes = {
  handleClick: PropTypes.func.isRequired
};

export default CloseButton;
