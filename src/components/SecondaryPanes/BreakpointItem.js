/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import classnames from "classnames";

import CloseButton from "../shared/Button/Close";

import { features } from "../../utils/prefs";
import type { LocalBreakpoint } from "./Breakpoints";

type Props = {
  breakpoint: LocalBreakpoint,
  onClick: Function,
  onContextMenu: Function,
  onChange: Function,
  onCloseClick: Function
};

function getBreakpointLocation(source, line, column) {
  const isWasm = source && source.isWasm;
  const columnVal = features.columnBreakpoints && column ? `:${column}` : "";
  const bpLocation = isWasm
    ? `0x${line.toString(16).toUpperCase()}`
    : `${line}${columnVal}`;

  return bpLocation;
}

class BreakpointItem extends Component<Props> {
  render() {
    const {
      breakpoint,
      onClick,
      onChange,
      onContextMenu,
      onCloseClick
    } = this.props;

    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const column = breakpoint.location.column;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = !!breakpoint.condition;

    return (
      <div
        className={classnames({
          breakpoint,
          paused: isCurrentlyPaused,
          disabled: isDisabled,
          "is-conditional": isConditional
        })}
        key={locationId}
        onClick={onClick}
        onContextMenu={onContextMenu}
      >
        <input
          type="checkbox"
          className="breakpoint-checkbox"
          checked={!isDisabled}
          onChange={onChange}
          onClick={ev => ev.stopPropagation()}
        />
        <label className="breakpoint-label" title={breakpoint.text}>
          {breakpoint.text}
        </label>
        <div className="breakpoint-line-close">
          <div className="breakpoint-line">
            {getBreakpointLocation(breakpoint.location.source, line, column)}
          </div>
          <CloseButton
            handleClick={onCloseClick}
            tooltip={L10N.getStr("breakpoints.removeBreakpointTooltip")}
          />
        </div>
      </div>
    );
  }
}

export default BreakpointItem;
