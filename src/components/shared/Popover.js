import { DOM as dom, PropTypes, createFactory, Component } from "react";
import ReactDOM from "react-dom";
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
    const { left, top, orientation, targetMid } = type == "popover"
      ? this.getPopoverCoords()
      : this.getTooltipCoords();

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top, orientation, targetMid });
  }

  calculateLeft(target, editor, popover) {
    const leftOffset = target.width / 2 - popover.width / 5;
    const estimatedLeft = target.left + leftOffset;
    const estimatedRight = estimatedLeft + popover.width;
    const isOverflowingRight = estimatedRight > editor.right;
    if (isOverflowingRight) {
      const adjustedLeft = editor.right - popover.width - 8;
      return adjustedLeft;
    }
    return estimatedLeft;
  }

  calculateVerticalOrientation(target, editor, popover) {
    const estimatedBottom = target.bottom + popover.height;

    return estimatedBottom > editor.bottom ? "up" : "down";
  }

  getPopoverCoords() {
    const popover = ReactDOM.findDOMNode(this);
    const popoverRect = popover.getBoundingClientRect();

    const editor = document.querySelector(".editor-wrapper");
    const editorRect = editor.getBoundingClientRect();

    const targetRect = this.props.targetPosition;

    const popoverLeft = this.calculateLeft(targetRect, editorRect, popoverRect);
    const orientation = this.calculateVerticalOrientation(
      targetRect,
      editorRect,
      popoverRect
    );
    const top = orientation == "down"
      ? targetRect.bottom
      : targetRect.top - popoverRect.height;

    const targetMid = targetRect.left - popoverLeft + targetRect.width / 2 - 8;

    return { left: popoverLeft, top, orientation, targetMid };
  }

  getTooltipCoords() {
    const tooltip = ReactDOM.findDOMNode(this);
    const tooltipRect = tooltip.getBoundingClientRect();
    const targetRect = this.props.targetPosition;

    const editor = document.querySelector(".editor-wrapper");
    const editorRect = editor.getBoundingClientRect();

    const left = this.calculateLeft(targetRect, editorRect, tooltipRect);
    const top = targetRect.top - tooltipRect.height;

    return { left, top, orientation: "up", targetMid: 0 };
  }

  getChildren() {
    const { children } = this.props;
    const { orientation } = this.state;
    const gap = dom.div({ className: "gap", key: "gap" });
    return orientation === "up" ? [children, gap] : [gap, children];
  }

  getPopoverArrow(orientation, left) {
    const arrowOrientation = orientation === "up" ? "down" : "up";

    const arrowProp = arrowOrientation === "up" ? "top" : "bottom";
    const arrowPropValue = arrowOrientation === "up" ? -8 : 6;

    return new BracketArrow({
      orientation: arrowOrientation,
      left,
      [arrowProp]: arrowPropValue
    });
  }

  renderPopover() {
    const { onMouseLeave } = this.props;
    const { top, left, orientation, targetMid } = this.state;

    const arrow = this.getPopoverArrow(orientation, targetMid);

    return dom.div(
      {
        className: classNames("popover", { up: orientation === "up" }),
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
  targetPosition: PropTypes.object,
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
