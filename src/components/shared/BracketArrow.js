// @flow

import React from "react";
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
  return (
    <div
      className={classNames("bracket-arrow", orientation || "up")}
      style={{ left, top, bottom }}
    />
  );
};

export default BracketArrow;
