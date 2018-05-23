/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import * as I from "immutable";
import { groupBy, sortBy } from "lodash";

import Breakpoint from "./Breakpoint";
import SourceIcon from "../shared/SourceIcon";

import actions from "../../actions";
import {
  getFilename,
  getFilenameFromURL,
  getRawSourceURL
} from "../../utils/source";
import {
  getPauseReason,
  getSelectedSource,
  getTopFrame,
  getMappedBreakpoints
} from "../../selectors";
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
  source: Source,
  frame: Frame
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
  selectSpecificLocation: Object => void,
  removeBreakpoint: string => void,
  removeAllBreakpoints: () => void,
  removeBreakpoints: BreakpointsMap => void,
  toggleBreakpoints: (boolean, BreakpointsMap) => void,
  toggleAllBreakpoints: boolean => void,
  toggleDisabledBreakpoint: number => void,
  setBreakpointCondition: Location => void,
  openConditionalPanel: number => void,
  shouldPauseOnExceptions: boolean,
  shouldPauseOnCaughtExceptions: boolean,
  pauseOnExceptions: Function,
  why?: Why,
  frame?: Frame
};

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
    this.props.selectSpecificLocation(breakpoint.location);
  }

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  }

  renderBreakpoint(breakpoint) {
    const { selectedSource, why, frame } = this.props;

    return (
      <Breakpoint
        key={breakpoint.locationId}
        breakpoint={breakpoint}
        selectedSource={selectedSource}
        why={why}
        frame={frame}
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
      shouldPauseOnCaughtExceptions,
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
      L10N.getStr("pauseOnCaughtExceptionsItem"),
      shouldPauseOnCaughtExceptions,
      () => pauseOnExceptions(true, !shouldPauseOnCaughtExceptions),
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
      bp => getRawSourceURL(bp.source.url)
    );

    return [
      ...Object.keys(groupedBreakpoints)
        .sort(sortFilenames)
        .map(url => {
          const groupBreakpoints = groupedBreakpoints[url].filter(
            bp => !bp.hidden && (bp.text || bp.originalText)
          );

          if (!groupBreakpoints.length) {
            return null;
          }

          const { source } = groupBreakpoints[0];

          return [
            <div
              className="breakpoint-heading"
              title={url}
              key={url}
              onClick={() => this.props.selectSource(source.id)}
            >
              <SourceIcon source={source} />
              {getFilename(source)}
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

const mapStateToProps = state => ({
  breakpoints: getMappedBreakpoints(state),
  frame: getTopFrame(state),
  why: getPauseReason(state),
  selectedSource: getSelectedSource(state)
});

export default connect(mapStateToProps, actions)(Breakpoints);
