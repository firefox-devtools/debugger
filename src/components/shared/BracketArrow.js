import { DOM as dom, PropTypes, Component } from "react";
import classNames from "classnames";

import "./BracketArrow.css";

class BracketArrow extends Component {
  render() {
    const { dir, left, top, bottom } = this.props;
    return dom.div(
      {
        className: classNames("bracket-arrow", dir || "up"),
        style: { left, top, bottom }
      },
      ""
    );
  }
}

BracketArrow.propTypes = {
  dir: PropTypes.string,
  left: PropTypes.number,
  top: PropTypes.number,
  bottom: PropTypes.number
};

BracketArrow.displayName = "BracketArrow";

export default BracketArrow;
