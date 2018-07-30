/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import classnames from "classnames";
import { connect } from "react-redux";

import Breakpoint from "./Breakpoint";
import SourceIcon from "../../shared/SourceIcon";

import actions from "../../../actions";
import {
  getTruncatedFileName,
  getDisplayPath,
  getRawSourceURL
} from "../../../utils/source";
import { makeLocationId } from "../../../utils/breakpoint";

import { getSelectedSource, getBreakpointSources } from "../../../selectors";

import type { Source } from "../../../types";
import type { BreakpointSources } from "../../../selectors/breakpointSources";

import "./Breakpoints.css";

type Props = {
  breakpointSources: BreakpointSources,
  selectedSource: Source,
  shouldPauseOnExceptions: boolean,
  shouldPauseOnCaughtExceptions: boolean,
  pauseOnExceptions: Function,
  selectSource: string => void
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

class Breakpoints extends Component<Props> {
  renderExceptionsOptions() {
    const {
      breakpointSources,
      shouldPauseOnExceptions,
      shouldPauseOnCaughtExceptions,
      pauseOnExceptions
    } = this.props;

    const isEmpty = breakpointSources.length == 0;

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
    const { breakpointSources } = this.props;
    const sources = [
      ...breakpointSources.map(({ source, breakpoints }) => source)
    ];

    return [
      ...breakpointSources.map(({ source, breakpoints, i }) => {
        const path = getDisplayPath(source, sources);
        return [
          <div
            className="breakpoint-heading"
            title={getRawSourceURL(source.url)}
            key={source.url}
            onClick={() => this.props.selectSource(source.id)}
          >
            <SourceIcon
              source={source}
              shouldHide={icon => ["file", "javascript"].includes(icon)}
            />
            <div className="filename">
              {getTruncatedFileName(source)}
              {path && <span>{`../${getDisplayPath(source, sources)}/..`}</span>}
            </div>
          </div>,
          ...breakpoints.map(breakpoint => (
            <Breakpoint
              breakpoint={breakpoint}
              source={source}
              key={makeLocationId(breakpoint.location)}
            />
          ))
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
  breakpointSources: getBreakpointSources(state),
  selectedSource: getSelectedSource(state)
});

export default connect(mapStateToProps, {
  pauseOnExceptions: actions.pauseOnExceptions,
  selectSource: actions.selectSource
})(Breakpoints);
