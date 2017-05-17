import { DOM as dom, PropTypes } from "react";
import classNames from "classnames";

import "./BracketArrow.css";

const BracketArrow = ({ orientation, left, top, bottom }) => {
  return dom.div(
    {
      className: classNames("bracket-arrow", orientation || "up"),
      style: { left, top, bottom }
    },
    ""
  );
};

BracketArrow.propTypes = {
  orientation: PropTypes.string,
  left: PropTypes.number,
  top: PropTypes.number,
  bottom: PropTypes.number
};

BracketArrow.displayName = "BracketArrow";

export default BracketArrow;
