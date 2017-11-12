/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React, { Component } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import BracketArrow from "./BracketArrow";

import "./Popover.css";

type Props = {
  target: Object,
  targetPosition: Object,
  children: Object,
  onMouseLeave?: () => void,
  type?: string
};

class Popover extends Component {
  props: Props;

  static defaultProps = {
    onMouseLeave: () => {},
    type: "popover"
  };

  constructor() {
    super();
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.state = {
      left: 0,
      top: 0
    };
  }

  componentDidMount() {
    const { type } = this.props;
    const { left, top, orientation, targetMid } =
      type == "popover" ? this.getPopoverCoords() : this.getTooltipCoords();

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top, orientation, targetMid });
  }

  calculateLeft(target, editor, popover) {
    const estimatedLeft = target.left;
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
    const top =
      orientation == "down"
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
    const gap = <div className="gap" key="gap" />;
    return orientation === "up" ? [children, gap] : [gap, children];
  }

  getPopoverArrow(orientation, left) {
    const arrowOrientation = orientation === "up" ? "down" : "up";

    const arrowProp = arrowOrientation === "up" ? "top" : "bottom";
    const arrowPropValue = arrowOrientation === "up" ? -7 : 5;

    const arrowProps = {
      orientation: arrowOrientation,
      left,
      [arrowProp]: arrowPropValue
    };

    return <BracketArrow {...arrowProps} />;
  }

  onMouseLeave(e) {
    const { onMouseLeave } = this.props;

    if (e.target.className.match(/(bracket-arrow|gap)/)) {
      return;
    }

    onMouseLeave();
  }

  renderPopover() {
    const { top, left, orientation, targetMid } = this.state;

    const arrow = this.getPopoverArrow(orientation, targetMid);

    return (
      <div
        className={classNames("popover", { up: orientation === "up" })}
        onMouseLeave={this.onMouseLeave}
        style={{ top, left }}
      >
        {arrow}
        {this.getChildren()}
      </div>
    );
  }

  renderTooltip() {
    const { onMouseLeave } = this.props;
    const { top, left } = this.state;

    return (
      <div
        className="tooltip"
        onMouseLeave={onMouseLeave}
        style={{ top, left }}
      >
        {this.getChildren()}
      </div>
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

export default Popover;
