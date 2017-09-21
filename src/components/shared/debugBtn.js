import React from "react";

import Svg from "../shared/Svg";
import classnames from "classnames";

export default function debugBtn(
  onClick,
  type,
  className,
  tooltip,
  disabled = false
) {
  const props = {
    onClick,
    key: type,
    "aria-label": tooltip,
    title: tooltip,
    disabled
  };

  return (
    <button className={classnames(type, className)} {...props}>
      <Svg name={type} />
    </button>
  );
}
