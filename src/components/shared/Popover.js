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
  onPopoverCoords: Function,
  onMouseLeave: (e: SyntheticMouseEvent<HTMLDivElement>) => void,
  onKeyDown: (e: KeyboardEvent) => void,
  type?: "popover" | "tooltip"
};

type Orientation = "up" | "down" | "right";
type TargetMid = {
  x: number,
  y: number
};
export type Coords = {
  left: number,
  top: number,
  targetMid: TargetMid,
  orientation: Orientation
};

type State = { coords: Coords };

class Popover extends Component<Props, State> {
  $popover: ?HTMLDivElement;
  $tooltip: ?HTMLDivElement;
  state = {
    coords: {
      left: 0,
      top: 0,
      orientation: "down",
      targetMid: { x: 0, y: 0 }
    }
  };

  static defaultProps = {
    onMouseLeave: () => {},
    onPopoverCoords: () => {},
    onKeyDown: () => {},
    type: "popover"
  };

  componentDidMount() {
    const { type } = this.props;
    const coords =
      type == "popover" ? this.getPopoverCoords() : this.getTooltipCoords();

    if (coords) {
      this.setState({ coords });
    }

    this.props.onPopoverCoords(coords);
  }

  calculateLeft(
    target: ClientRect,
    editor: ClientRect,
    popover: ClientRect,
    orientation?: Orientation
  ) {
    const estimatedLeft = target.left;
    const estimatedRight = estimatedLeft + popover.width;
    const isOverflowingRight = estimatedRight > editor.right;
    if (orientation === "right") {
      return target.left + target.width + 10;
    }
    if (isOverflowingRight) {
      const adjustedLeft = editor.right - popover.width - 8;
      return adjustedLeft;
    }
    return estimatedLeft;
  }

  calculateTopForRightOrientation = (
    target: ClientRect,
    editor: ClientRect,
    popover: ClientRect
  ) => {
    if (popover.height < editor.height) {
      const rightOrientationTop = target.top - popover.height / 2;
      if (rightOrientationTop < editor.top) {
        return editor.top;
      }
      const rightOrientationBottom = rightOrientationTop + popover.height;
      if (rightOrientationBottom > editor.bottom) {
        return editor.bottom - popover.height;
      }
      return rightOrientationTop;
    }
    return 0;
  };

  calculateOrientation(
    target: ClientRect,
    editor: ClientRect,
    popover: ClientRect
  ) {
    const estimatedBottom = target.bottom + popover.height;
    if (editor.bottom > estimatedBottom) {
      return "down";
    }
    const upOrientationTop = target.top - popover.height;
    if (upOrientationTop > editor.top) {
      return "up";
    }

    return "right";
  }

  calculateTop = (
    target: ClientRect,
    editor: ClientRect,
    popover: ClientRect,
    orientation?: string
  ) => {
    if (orientation === "down") {
      return target.bottom;
    }
    if (orientation === "up") {
      return target.top - popover.height;
    }

    return this.calculateTopForRightOrientation(target, editor, popover);
  };

  getPopoverCoords() {
    if (this.$popover) {
      // const popover = this.$popover;
      // const editor = this.props.editorRef;
      // const popoverRect = popover.getBoundingClientRect();
      // const editorRect = editor.getBoundingClientRect();
      const targetRect = this.props.targetPosition;
      // const popoverLeft = this.calculateLeft(
      //   targetRect,
      //   editorRect,
      //   popoverRect
      // );
      // const orientation = this.calculateVerticalOrientation(
      //   targetRect,
      //   editorRect,
      //   popoverRect
      // );
      // const top =
      //   orientation == "down"
      //     ? targetRect.bottom
      //     : targetRect.top - popoverRect.height;

      const top = targetRect.top + targetRect.height;
      const targetMid = targetRect.width / 2 - 8;

      return { left: targetRect.left, top, orientation: "down", targetMid };
    }

    return {
      left: popoverLeft,
      top,
      orientation,
      targetMid
    };
  }

  getTooltipCoords() {
    if (!this.$tooltip) {
      return null;
    }
    const tooltip = this.$tooltip;
    const tooltipRect = tooltip.getBoundingClientRect();
    const targetRect = this.props.targetPosition;
    const top = targetRect.top - tooltipRect.height;
    // const editorRect = editor.getBoundingClientRect();
    // const targetRect = this.props.targetPosition;
    // const left = this.calculateLeft(targetRect, editorRect, tooltipRect);
    // const enoughRoomForTooltipAbove =
    //   targetRect.top - editorRect.top > tooltipRect.height;
    // const top = enoughRoomForTooltipAbove
    //   ? targetRect.top - tooltipRect.height
    //   : targetRect.bottom;
    return { left: targetRect.left, top, orientation: "up", targetMid: { x: 0, y: 0 } };
  }

  getChildren() {
    const { children } = this.props;
    const { orientation } = this.state.coords;
    const gap = <div className="gap" key="gap" />;
    return orientation === "up" ? [children, gap] : [gap, children];
  }

  getPopoverArrow(orientation: Orientation, left: number, top: number) {
    const arrowProps = {};
    if (orientation === "up") {
      Object.assign(arrowProps, { orientation: "down", bottom: 5, left });
    } else if (orientation === "down") {
      Object.assign(arrowProps, { orientation: "up", top: -7, left });
    } else {
      Object.assign(arrowProps, { orientation: "left", top, left: -14 });
    }

    return <BracketArrow {...arrowProps} />;
  }

  renderPopover() {
    const { top, left, orientation, targetMid } = this.state.coords;
    const { onMouseLeave, onKeyDown } = this.props;
    const arrow = this.getPopoverArrow(orientation, targetMid.x, targetMid.y);

    return (
      <div
        className={classNames("popover", `orientation-${orientation}`, {
          up: orientation === "up"
        })}
        onMouseLeave={onMouseLeave}
        onKeyDown={onKeyDown}
        style={{ top, left }}
        ref={c => (this.$popover = c)}
      >
        {arrow}
        {this.getChildren()}
      </div>
    );
  }

  renderTooltip() {
    const { top, left } = this.state.coords;
    const { onMouseLeave, onKeyDown } = this.props;
    return (
      <div
        className="tooltip"
        onMouseLeave={onMouseLeave}
        onKeyDown={onKeyDown}
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
