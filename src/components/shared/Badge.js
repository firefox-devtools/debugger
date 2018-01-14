// @flow
import React from "react";
import "./Badge.css";

type Props = {
  children: number
};

const Badge = ({ children }: Props) => (
  <div className="badge text-white text-center">{children}</div>
);

export default Badge;
