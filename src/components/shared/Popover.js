import { DOM as dom, PropTypes, createFactory, Component } from "react";
import ReactDOM from "../../../node_modules/react-dom/dist/react-dom";
import classNames from "classnames";
import _BracketArrow from "./BracketArrow";
const BracketArrow = createFactory(_BracketArrow);

import "./Popover.css";

class Popover extends Component {
  constructor() {
    super();
    this.state = {
      left: 0,
      top: 0
    };
  }

  componentDidMount() {
    const { type } = this.props;
    const { left, top, dir, targetMid } = type == "popover"
      ? this.getPopoverCoords()
      : this.getTooltipCoords();

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top, dir, targetMid });
  }

  getPopoverCoords() {
    const el = ReactDOM.findDOMNode(this);
    const wrapper = document.getElementsByClassName("editor-wrapper")[0];
    const { right: wrapperRight } = wrapper.getBoundingClientRect();
    const { width, height } = el.getBoundingClientRect();
    const {
      left: targetLeft,
      width: targetWidth,
      bottom: targetBottom,
      top: targetTop
    } = this.props.target.getBoundingClientRect();

    // width division corresponds to calc in Popover.css
    const left = targetLeft + targetWidth / 2 - width / 5;

    const isOverflowingRight = left + width > wrapperRight;
    left = isOverflowingRight ? wrapperRight - width : left;

    const dir = targetBottom + height > window.innerHeight ? "up" : "down";
    const top = dir == "down" ? targetBottom : targetTop - height;

    const targetMid = targetLeft - left + targetWidth / 2 - 8;

    return { left, top, dir, targetMid };
  }

  getTooltipCoords() {
    const el = ReactDOM.findDOMNode(this);
    const { height } = el.getBoundingClientRect();
    const {
      left: targetLeft,
      width: targetWidth,
      top: targetTop
    } = this.props.target.getBoundingClientRect();

    const left = targetLeft + targetWidth / 4 - 10;
    const top = targetTop - height;

    return { left, top, dir: "up", targetMid: 0 };
  }

  getChildren() {
    const { children } = this.props;
    const { dir } = this.state;
    const gap = dom.div({ className: "gap", key: "gap" });
    return dir === "up" ? [children, gap] : [gap, children];
  }

  renderPopover() {
    const { onMouseLeave } = this.props;
    const { top, left, dir, targetMid } = this.state;

    const arrow = new BracketArrow({
      dir: dir === "up" ? "down" : "up",
      left: targetMid,
      [dir == "down" ? "top" : "bottom"]: dir == "down" ? -8 : 6
    });

    return dom.div(
      {
        className: classNames("popover", { up: dir === "up" }),
        onMouseLeave,
        style: { top, left }
      },
      arrow,
      this.getChildren()
    );
  }

  renderTooltip() {
    const { onMouseLeave } = this.props;
    const { top, left } = this.state;

    return dom.div(
      {
        className: "tooltip",
        onMouseLeave,
        style: { top, left }
      },
      this.getChildren()
    );
  }

  render() {
    const { type } = this.props;

    if (type === "tooltip") {
      return this.renderTooltip();
    }

    return this.renderPopover();
  }
}

Popover.propTypes = {
  target: PropTypes.object,
  children: PropTypes.object,
  onMouseLeave: PropTypes.func,
  type: PropTypes.string
};

Popover.defaultProps = {
  onMouseLeave: () => {},
  type: "popover"
};

Popover.displayName = "Popover";

export default Popover;
