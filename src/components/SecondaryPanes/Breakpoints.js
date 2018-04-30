/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import * as I from "immutable";
import { createSelector } from "reselect";
import { groupBy, sortBy } from "lodash";

import Breakpoint from "./Breakpoint";

import actions from "../../actions";
import { getFilenameFromURL } from "../../utils/source";
import {
  getSources,
  getSourceInSources,
  getBreakpoints,
  getPauseReason,
  getSelectedSource,
  getTopFrame
} from "../../selectors";
import { isInterrupted } from "../../utils/pause";
import { makeLocationId } from "../../utils/breakpoint";
import showContextMenu from "./BreakpointsContextMenu";

import type {
  Breakpoint as BreakpointType,
  Location,
  Source,
  Frame,
  Why
} from "../../types";

import type { SourcesMap, SourceMetaDataMap } from "../../reducers/types";

import "./Breakpoints.css";

export type LocalBreakpoint = BreakpointType & {
  location: Location,
  isCurrentlyPaused: boolean,
  locationId: string,
  source: Source
};

type BreakpointsMap = I.Map<string, LocalBreakpoint>;

type Props = {
  breakpoints: BreakpointsMap,
  sources: SourcesMap,
  selectedSource: Source,
  selectSource: String => void,
  sourcesMetaData: SourceMetaDataMap,
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
  openConditionalPanel: number => void,
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean,
  pauseOnExceptions: Function
};

function isCurrentlyPausedAtBreakpoint(
  frame: Frame,
  why: Why,
  breakpoint: LocalBreakpoint
) {
  if (!frame || !isInterrupted(why)) {
    return false;
  }

  const bpId = makeLocationId(breakpoint.location);
  const pausedId = makeLocationId(frame.location);
  return bpId === pausedId;
}

function createExceptionOption(
  label: string,
  value: boolean,
  onChange: Function,
  className: string
) {
  return (
    <div className={className} onClick={onChange}>
      <input
        type="checkbox"
        checked={value ? "checked" : ""}
        onChange={e => e.stopPropagation() && onChange()}
      />
      <div className="breakpoint-exceptions-label">{label}</div>
    </div>
  );
}

function sortFilenames(urlA, urlB) {
  const filenameA = getFilenameFromURL(urlA);
  const filenameB = getFilenameFromURL(urlB);

  if (filenameA > filenameB) {
    return 1;
  }
  if (filenameA < filenameB) {
    return -1;
  }

  return 0;
}

class Breakpoints extends Component<Props> {
  handleBreakpointCheckbox(breakpoint) {
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
    const { selectedSource } = this.props;

    return (
      <Breakpoint
        key={breakpoint.locationId}
        breakpoint={breakpoint}
        selectedSource={selectedSource}
        onClick={() => this.selectBreakpoint(breakpoint)}
        onContextMenu={e =>
          showContextMenu({ ...this.props, breakpoint, contextMenuEvent: e })
        }
        onChange={() => this.handleBreakpointCheckbox(breakpoint)}
        onCloseClick={ev => this.removeBreakpoint(ev, breakpoint)}
      />
    );
  }

  renderExceptionsOptions() {
    const {
      breakpoints,
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      pauseOnExceptions
    } = this.props;

    const isEmpty = breakpoints.size == 0;

    const exceptionsBox = createExceptionOption(
      L10N.getStr("pauseOnExceptionsItem2"),
      shouldPauseOnExceptions,
      () => pauseOnExceptions(!shouldPauseOnExceptions, false),
      "breakpoints-exceptions"
    );

    const ignoreCaughtBox = createExceptionOption(
      L10N.getStr("ignoreCaughtExceptionsItem"),
      shouldIgnoreCaughtExceptions,
      () => pauseOnExceptions(true, !shouldIgnoreCaughtExceptions),
      "breakpoints-exceptions-caught"
    );

    return (
      <div
        className={classnames("breakpoints-exceptions-options", {
          empty: isEmpty
        })}
      >
        {exceptionsBox}
        {shouldPauseOnExceptions ? ignoreCaughtBox : null}
      </div>
    );
  }

  renderBreakpoints() {
    const { breakpoints } = this.props;
    if (breakpoints.size == 0) {
      return;
    }

    const groupedBreakpoints = groupBy(
      sortBy([...breakpoints.valueSeq()], bp => bp.location.line),
      bp => bp.source.url
    );

    return [
      ...Object.keys(groupedBreakpoints)
        .sort(sortFilenames)
        .map(url => {
          const file = getFilenameFromURL(url);
          const groupBreakpoints = groupedBreakpoints[url].filter(
            bp => !bp.hidden && (bp.text || bp.originalText)
          );

          if (!groupBreakpoints.length) {
            return null;
          }

          return [
            <div
              className="breakpoint-heading"
              title={url}
              key={url}
              onClick={() =>
                this.props.selectSource(groupBreakpoints[0].source.id)
              }
            >
              {file}
            </div>,
            ...groupBreakpoints.map(bp => this.renderBreakpoint(bp))
          ];
        })
    ];
  }

  render() {
    return (
      <div className="pane breakpoints-list">
        {this.renderExceptionsOptions()}
        {this.renderBreakpoints()}
      </div>
    );
  }
}

function updateLocation(sources, frame, why, bp): LocalBreakpoint {
  const source = getSourceInSources(sources, bp.location.sourceId);
  const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(frame, why, bp);
  const locationId = makeLocationId(bp.location);
  const localBP = { ...bp, locationId, isCurrentlyPaused, source };

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
      .filter(bp => bp.source && !bp.source.isBlackBoxed)
);

const mapStateToProps = state => ({
  breakpoints: _getBreakpoints(state),
  selectedSource: getSelectedSource(state)
});

export default connect(mapStateToProps, actions)(Breakpoints);
