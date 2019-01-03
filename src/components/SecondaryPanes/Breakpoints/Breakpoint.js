/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "../../../utils/connect";
import { createSelector } from "reselect";
import classnames from "classnames";

import actions from "../../../actions";

import showContextMenu from "./BreakpointsContextMenu";
import { CloseButton } from "../../shared/Button";

import { getLocationWithoutColumn } from "../../../utils/breakpoint";
import { getSelectedLocation } from "../../../utils/source-maps";
import { features } from "../../../utils/prefs";
import { getEditor } from "../../../utils/editor";

import type { FormattedBreakpoint } from "../../../selectors/breakpointSources";

import type {
  Breakpoint as BreakpointType,
  Frame,
  Source,
  SourceLocation
} from "../../../types";

type FormattedFrame = Frame & {
  selectedLocation: SourceLocation
};

import {
  getBreakpointsList,
  getSelectedFrame,
  getSelectedSource
} from "../../../selectors";

type Props = {
  breakpoint: FormattedBreakpoint,
  breakpoints: BreakpointType[],
  source: Source,
  frame: FormattedFrame,
  enableBreakpoint: typeof actions.enableBreakpoint,
  removeBreakpoint: typeof actions.removeBreakpoint,
  removeBreakpoints: typeof actions.removeBreakpoints,
  removeAllBreakpoints: typeof actions.removeAllBreakpoints,
  disableBreakpoint: typeof actions.disableBreakpoint,
  setBreakpointCondition: typeof actions.setBreakpointCondition,
  toggleAllBreakpoints: typeof actions.toggleAllBreakpoints,
  toggleBreakpoints: typeof actions.toggleBreakpoints,
  toggleDisabledBreakpoint: typeof actions.toggleDisabledBreakpoint,
  openConditionalPanel: typeof actions.openConditionalPanel,
  selectSpecificLocation: typeof actions.selectSpecificLocation
};

class Breakpoint extends PureComponent<Props> {
  onContextMenu = e => {
    showContextMenu({ ...this.props, contextMenuEvent: e });
  };

  onDoubleClick = () => {
    const { breakpoint, openConditionalPanel } = this.props;
    if (breakpoint.condition) {
      openConditionalPanel(breakpoint.selectedLocation);
    }
  };

  selectBreakpoint = () => {
    const { breakpoint, selectSpecificLocation } = this.props;
    selectSpecificLocation(breakpoint.selectedLocation);
  };

  removeBreakpoint = event => {
    const { breakpoint, removeBreakpoint } = this.props;

    event.stopPropagation();
    removeBreakpoint(breakpoint.selectedLocation);
  };

  handleBreakpointCheckbox = () => {
    const { breakpoint, enableBreakpoint, disableBreakpoint } = this.props;
    if (breakpoint.disabled) {
      enableBreakpoint(breakpoint.selectedLocation);
    } else {
      disableBreakpoint(breakpoint.selectedLocation);
    }
  };

  isCurrentlyPausedAtBreakpoint() {
    const { frame, breakpoint } = this.props;
    if (!frame) {
      return false;
    }

    const bpId = getLocationWithoutColumn(breakpoint.selectedLocation);
    const frameId = getLocationWithoutColumn(frame.selectedLocation);

    return bpId == frameId;
  }

  getBreakpointLocation() {
    const { breakpoint, source } = this.props;
    const { column, line } = breakpoint.selectedLocation;

    const isWasm = source && source.isWasm;
    const columnVal = features.columnBreakpoints && column ? `:${column}` : "";
    const bpLocation = isWasm
      ? `0x${line.toString(16).toUpperCase()}`
      : `${line}${columnVal}`;

    return bpLocation;
  }

  getBreakpointText() {
    const { breakpoint } = this.props;
    return breakpoint.condition || breakpoint.text;
  }

  highlightText() {
    const text = this.getBreakpointText() || "";
    const editor = getEditor();

    if (!editor.CodeMirror) {
      return { __html: text };
    }

    const node = document.createElement("div");
    editor.CodeMirror.runMode(text, "application/javascript", node);
    return { __html: node.innerHTML };
  }

  /* eslint-disable react/no-danger */
  render() {
    const { breakpoint } = this.props;
    return (
      <div
        className={classnames({
          breakpoint,
          paused: this.isCurrentlyPausedAtBreakpoint(),
          disabled: breakpoint.disabled,
          "is-conditional": !!breakpoint.condition,
          log: breakpoint.log
        })}
        onClick={this.selectBreakpoint}
        onDoubleClick={this.onDoubleClick}
        onContextMenu={this.onContextMenu}
      >
        <input
          id={breakpoint.id}
          type="checkbox"
          className="breakpoint-checkbox"
          checked={!breakpoint.disabled}
          onChange={this.handleBreakpointCheckbox}
          onClick={ev => ev.stopPropagation()}
        />
        <label
          htmlFor={breakpoint.id}
          className="breakpoint-label cm-s-mozilla"
          title={this.getBreakpointText()}
        >
          <span dangerouslySetInnerHTML={this.highlightText()} />
        </label>
        <div className="breakpoint-line-close">
          <div className="breakpoint-line">{this.getBreakpointLocation()}</div>
          <CloseButton
            handleClick={e => this.removeBreakpoint(e)}
            tooltip={L10N.getStr("breakpoints.removeBreakpointTooltip")}
          />
        </div>
      </div>
    );
  }
}

const getFormattedFrame = createSelector(
  getSelectedSource,
  getSelectedFrame,
  (selectedSource: ?Source, frame: ?Frame): ?FormattedFrame => {
    if (!frame) {
      return null;
    }

    return {
      ...frame,
      selectedLocation: getSelectedLocation(frame, selectedSource)
    };
  }
);

const mapStateToProps = state => ({
  breakpoints: getBreakpointsList(state),
  frame: getFormattedFrame(state)
});

export default connect(
  mapStateToProps,
  {
    enableBreakpoint: actions.enableBreakpoint,
    removeBreakpoint: actions.removeBreakpoint,
    removeBreakpoints: actions.removeBreakpoints,
    removeAllBreakpoints: actions.removeAllBreakpoints,
    disableBreakpoint: actions.disableBreakpoint,
    selectSpecificLocation: actions.selectSpecificLocation,
    setBreakpointCondition: actions.setBreakpointCondition,
    toggleAllBreakpoints: actions.toggleAllBreakpoints,
    toggleBreakpoints: actions.toggleBreakpoints,
    toggleDisabledBreakpoint: actions.toggleDisabledBreakpoint,
    openConditionalPanel: actions.openConditionalPanel
  }
)(Breakpoint);
