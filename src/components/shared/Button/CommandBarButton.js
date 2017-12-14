import classnames from "classnames";
import React from "react";

import "./CommandBarButton.css";

type Props = {
  pressed: boolean,
  className: string,
  children: any
};

const CommandBarButton = (props: Props) => {
  const { pressed = false, className, children, ...rest } = props;

  return (
    <button
      className={classnames("command-bar-button", className)}
      aria-pressed={pressed}
      {...rest}
    >
      {children}
    </button>
  );
};

export default CommandBarButton;
