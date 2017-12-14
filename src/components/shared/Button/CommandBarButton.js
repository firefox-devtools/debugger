import classnames from "classnames";
import React from "react";

import "./CommandBarButton.css";

type Props = {
  children: any,
  className: string,
  pressed: boolean
};

const CommandBarButton = (props: Props) => {
  const { children, className, pressed = false, ...rest } = props;

  return (
    <button
      aria-pressed={pressed}
      className={classnames("command-bar-button", className)}
      {...rest}
    >
      {children}
    </button>
  );
};

export default CommandBarButton;
