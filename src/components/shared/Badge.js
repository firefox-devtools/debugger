import React from "react";
import "./Badge.css";

const Badge = ({ children }) => (
  <div className="badge text-white text-center rounded-circle">{children}</div>
);

export default Badge;
