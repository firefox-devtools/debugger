// @flow

import { DOM as dom } from "react";
import classNames from "classnames";

import "./BracketArrow.css";

const BracketArrow = ({
  orientation,
  left,
  top,
  bottom
}: {
  orientation: string,
  left: number,
  top: number,
  bottom: number
}) => {
  return dom.div(
    {
      className: classNames("bracket-arrow", orientation || "up"),
      style: { left, top, bottom }
    },
    ""
  );
};

BracketArrow.displayName = "BracketArrow";

export default BracketArrow;
