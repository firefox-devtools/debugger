/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as I from "immutable";
import classnames from "classnames";
import { createSelector } from "reselect";
import { groupBy, sortBy } from "lodash";

import actions from "../../actions";
import CloseButton from "../shared/Button/Close";
import { features } from "../../utils/prefs";
import { getFilename } from "../../utils/source";
import {
  getSources,
  getSourceInSources,
  getBreakpoints,
  getPauseReason,
  getTopFrame
} from "../../selectors";
import { isInterrupted } from "../../utils/pause";
import { makeLocationId } from "../../utils/breakpoint";
import showContextMenu from "./BreakpointsContextMenu";

import type { Breakpoint, Location } from "../../types";

import "./Breakpoints.css";

type LocalBreakpoint = Breakpoint & {
  location: any,
  isCurrentlyPaused: boolean,
  locationId: string
};

type BreakpointsMap = I.Map<string, LocalBreakpoint>;

type Props = {
  breakpoints: BreakpointsMap,
  enableBreakpoint: Location => void,
  disableBreakpoint: Location => void,
  selectLocation: Object => void,
  removeBreakpoint: string => void,
  removeAllBreakpoints: () => void,
  removeBreakpoints: BreakpointsMap => void,
  toggleBreakpoints: (boolean, BreakpointsMap) => void,
  toggleAllBreakpoints: boolean => void,
  toggleDisabledBreakpoint: number => void,
  setBreakpointCondition: Location => void,
  openConditionalPanel: number => void
};

function isCurrentlyPausedAtBreakpoint(frame, why, breakpoint) {
  if (!frame || !isInterrupted(why)) {
    return false;
  }

  const bpId = makeLocationId(breakpoint.location);
  const pausedId = makeLocationId(frame.location);
  return bpId === pausedId;
}

function getBreakpointFilename(source) {
  return source && source.toJS ? getFilename(source.toJS()) : "";
}

function getBreakpointLocation(source, line, column) {
  const isWasm = source && source.isWasm;
  const columnVal = features.columnBreakpoints && column ? `:${column}` : "";
  const bpLocation = isWasm
    ? `0x${line.toString(16).toUpperCase()}`
    : `${line}${columnVal}`;

  return bpLocation;
}

class Breakpoints extends Component<Props> {
  shouldComponentUpdate(nextProps, nextState) {
    const { breakpoints } = this.props;
    return breakpoints !== nextProps.breakpoints;
  }

  handleCheckbox(breakpoint) {
    if (breakpoint.loading) {
      return;
    }

    if (breakpoint.disabled) {
      this.props.enableBreakpoint(breakpoint.location);
    } else {
      this.props.disableBreakpoint(breakpoint.location);
    }
  }

  selectBreakpoint(breakpoint) {
    this.props.selectLocation(breakpoint.location);
  }

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  }

  renderBreakpoint(breakpoint) {
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const column = breakpoint.location.column;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = !!breakpoint.condition;
    const isHidden = breakpoint.hidden;

    if (isHidden) {
      return;
    }

    return (
      <div
        className={classnames({
          breakpoint,
          paused: isCurrentlyPaused,
          disabled: isDisabled,
          "is-conditional": isConditional
        })}
        key={locationId}
        onClick={() => this.selectBreakpoint(breakpoint)}
        onContextMenu={e =>
          showContextMenu({ ...this.props, breakpoint, contextMenuEvent: e })
        }
      >
        <input
          type="checkbox"
          className="breakpoint-checkbox"
          checked={!isDisabled}
          onChange={() => this.handleCheckbox(breakpoint)}
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
            handleClick={ev => this.removeBreakpoint(ev, breakpoint)}
            tooltip={L10N.getStr("breakpoints.removeBreakpointTooltip")}
          />
        </div>
      </div>
    );
  }

  renderEmpty() {
    return <div className="pane-info">{L10N.getStr("breakpoints.none")}</div>;
  }

  renderBreakpoints() {
    const { breakpoints } = this.props;

    const groupedBreakpoints = groupBy(
      sortBy([...breakpoints.valueSeq()], bp => bp.location.line),
      bp => getBreakpointFilename(bp.location.source)
    );

    return [
      ...Object.keys(groupedBreakpoints).map(filename => {
        return [
          <div className="breakpoint-heading" title={filename} key={filename}>
            {filename}
          </div>,
          ...groupedBreakpoints[filename].map(bp => this.renderBreakpoint(bp))
        ];
      })
    ];
  }

  render() {
    const { breakpoints } = this.props;

    return (
      <div className="pane breakpoints-list">
        {breakpoints.size ? this.renderBreakpoints() : this.renderEmpty()}
      </div>
    );
  }
}

function updateLocation(sources, frame, why, bp): LocalBreakpoint {
  const source = getSourceInSources(sources, bp.location.sourceId);
  const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(frame, why, bp);
  const locationId = makeLocationId(bp.location);

  const location = { ...bp.location, source };
  const localBP = { ...bp, location, locationId, isCurrentlyPaused };

  return localBP;
}

const _getBreakpoints = createSelector(
  getBreakpoints,
  getSources,
  getTopFrame,
  getPauseReason,
  (breakpoints, sources, frame, why) =>
    breakpoints
      .map(bp => updateLocation(sources, frame, why, bp))
      .filter(bp => bp.location.source && !bp.location.source.isBlackBoxed)
);

export default connect(
  (state, props) => ({ breakpoints: _getBreakpoints(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
