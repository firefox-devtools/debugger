/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import classNames from "classnames";
import BracketArrow from "./BracketArrow";

import "./Popover.css";

type Props = {
  editorRef: ?HTMLDivElement,
  targetPosition: Object,
  children: ?React$Element<any>,
  onMouseLeave: () => void,
  type?: "popover" | "tooltip"
};

type Orientation = "up" | "down";
type State = {
  left: number,
  top: number,
  targetMid: number,
  orientation: Orientation
};

class Popover extends Component<Props, State> {
  $popover: ?HTMLDivElement;
  $tooltip: ?HTMLDivElement;
  constructor(props: Props) {
    super(props);
    this.state = {
      left: 0,
      top: 0,
      targetMid: 0,
      orientation: "up"
    };
  }

  static defaultProps = {
    onMouseLeave: () => {},
    type: "popover"
  };

  componentDidMount() {
    const { type } = this.props;
    const { left, top, orientation, targetMid } =
      type == "popover" ? this.getPopoverCoords() : this.getTooltipCoords();

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top, orientation, targetMid });
  }

  calculateLeft(target: ClientRect, editor: ClientRect, popover: ClientRect) {
    const estimatedLeft = target.left;
    const estimatedRight = estimatedLeft + popover.width;
    const isOverflowingRight = estimatedRight > editor.right;
    if (isOverflowingRight) {
      const adjustedLeft = editor.right - popover.width - 8;
      return adjustedLeft;
    }
    return estimatedLeft;
  }

  calculateVerticalOrientation(
    target: ClientRect,
    editor: ClientRect,
    popover: ClientRect
  ) {
    const estimatedBottom = target.bottom + popover.height;

    return estimatedBottom > editor.bottom ? "up" : "down";
  }

  getPopoverCoords() {
    if (this.$popover && this.props.editorRef) {
      const popover = this.$popover;
      const editor = this.props.editorRef;
      const popoverRect = popover.getBoundingClientRect();
      const editorRect = editor.getBoundingClientRect();
      const targetRect = this.props.targetPosition;
      const popoverLeft = this.calculateLeft(
        targetRect,
        editorRect,
        popoverRect
      );
      const orientation = this.calculateVerticalOrientation(
        targetRect,
        editorRect,
        popoverRect
      );
      const top =
        orientation == "down"
          ? targetRect.bottom
          : targetRect.top - popoverRect.height;

      const targetMid =
        targetRect.left - popoverLeft + targetRect.width / 2 - 8;

      return { left: popoverLeft, top, orientation, targetMid };
    }
    return { left: 0, top: 0, orientation: "down", targetMid: 0 };
  }

  getTooltipCoords() {
    if (this.$tooltip && this.props.editorRef) {
      const tooltip = this.$tooltip;
      const editor = this.props.editorRef;
      const tooltipRect = tooltip.getBoundingClientRect();
      const editorRect = editor.getBoundingClientRect();
      const targetRect = this.props.targetPosition;
      const left = this.calculateLeft(targetRect, editorRect, tooltipRect);
      const top = targetRect.top - tooltipRect.height;

      return { left, top, orientation: "up", targetMid: 0 };
    }
    return { left: 0, top: 0, orientation: "up", targetMid: 0 };
  }

  getChildren() {
    const { children } = this.props;
    const { orientation } = this.state;
    const gap = <div className="gap" key="gap" />;
    return orientation === "up" ? [children, gap] : [gap, children];
  }

  getPopoverArrow(orientation: Orientation, left: number) {
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

  onMouseLeave = (e: SyntheticMouseEvent<HTMLDivElement>) => {
    const { onMouseLeave } = this.props;
    if (/^(bracket-arrow|gap)$/.test(e.currentTarget.className)) {
      return;
    }

    onMouseLeave();
  };

  renderPopover() {
    const { top, left, orientation, targetMid } = this.state;
    const arrow = this.getPopoverArrow(orientation, targetMid);

    return (
      <div
        className={classNames("popover", { up: orientation === "up" })}
        onMouseLeave={this.onMouseLeave}
        style={{ top, left }}
        ref={c => (this.$popover = c)}
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
        ref={c => (this.$tooltip = c)}
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
