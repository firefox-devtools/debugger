/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import classnames from "classnames";
import * as I from "immutable";
import { sortBy } from "lodash";
import { createSelector } from "reselect";

import actions from "../../actions";
import {
  getSources,
  getSourceInSources,
  getBreakpoints,
  getPauseReason,
  getTopFrame
} from "../../selectors";
import { makeLocationId } from "../../utils/breakpoint";
import { isInterrupted } from "../../utils/pause";
import { features } from "../../utils/prefs";
import { getFilename } from "../../utils/source";
import { endTruncateStr } from "../../utils/utils";

import showContextMenu from "./BreakpointsContextMenu";
import CloseButton from "../shared/Button/Close";
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
  if (!isInterrupted(why)) {
    return false;
  }

  const bpId = makeLocationId(breakpoint.location);
  const pausedId = makeLocationId(frame.location);
  return bpId === pausedId;
}

function getBreakpointFilename(source) {
  return source && source.toJS ? getFilename(source.toJS()) : "";
}

function renderSourceLocation(source, line, column) {
  const filename = getBreakpointFilename(source);
  const isWasm = source && source.get("isWasm");
  const columnVal = features.columnBreakpoints && column ? `:${column}` : "";
  const bpLocation = isWasm
    ? `0x${line.toString(16).toUpperCase()}`
    : `${line}${columnVal}`;

  if (!filename) {
    return null;
  }

  return (
    <div className="location">
      {`${endTruncateStr(filename, 30)}: ${bpLocation}`}
    </div>
  );
}

class Breakpoints extends PureComponent<Props> {
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
    const snippet = breakpoint.text || "";
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
          {renderSourceLocation(breakpoint.location.source, line, column)}
        </label>
        <div className="breakpoint-snippet">{snippet}</div>
        <CloseButton
          handleClick={ev => this.removeBreakpoint(ev, breakpoint)}
          tooltip={L10N.getStr("breakpoints.removeBreakpointTooltip")}
        />
      </div>
    );
  }

  render() {
    const { breakpoints } = this.props;
    const children =
      breakpoints.size === 0 ? (
        <div className="pane-info">{L10N.getStr("breakpoints.none")}</div>
      ) : (
        sortBy(
          [...breakpoints.valueSeq()],
          [
            bp => getBreakpointFilename(bp.location.source),
            bp => bp.location.line
          ]
        ).map(bp => this.renderBreakpoint(bp))
      );

    return <div className="pane breakpoints-list">{children}</div>;
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
      .filter(
        bp => bp.location.source && !bp.location.source.get("isBlackBoxed")
      )
);

export default connect(
  (state, props) => ({ breakpoints: _getBreakpoints(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
