/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { isGeneratedId } from "devtools-source-map";

import classnames from "classnames";

import actions from "../../../actions";

import showContextMenu from "./BreakpointsContextMenu";
import { CloseButton } from "../../shared/Button";

import { getLocationWithoutColumn } from "../../../utils/breakpoint";

import { features } from "../../../utils/prefs";
import { getCodeMirror } from "../../../utils/editor";

import type {
  Frame,
  Source,
  Breakpoint as BreakpointType,
  MappedLocation
} from "../../../types";

import { getSelectedSource, getTopFrame } from "../../../selectors";

type Props = {
  breakpoint: BreakpointType,
  selectedSource: ?Source,
  disableBreakpoint: Function,
  enableBreakpoint: Function,
  removeBreakpoint: Function,
  selectSpecificLocation: Function,
  source: Source,
  frame: ?Frame
};

function getMappedLocation(mappedLocation: MappedLocation, selectedSource) {
  return selectedSource && isGeneratedId(selectedSource.id)
    ? mappedLocation.generatedLocation
    : mappedLocation.location;
}

class Breakpoint extends PureComponent<Props> {
  onContextMenu = e => {
    showContextMenu({ ...this.props, contextMenuEvent: e });
  };

  selectBreakpoint = () => {
    const { breakpoint, selectSpecificLocation } = this.props;
    selectSpecificLocation(breakpoint.location);
  };

  removeBreakpoint = event => {
    const { breakpoint, removeBreakpoint } = this.props;

    event.stopPropagation();
    removeBreakpoint(breakpoint.location);
  };

  handleBreakpointCheckbox = () => {
    const { breakpoint, enableBreakpoint, disableBreakpoint } = this.props;
    if (breakpoint.loading) {
      return;
    }

    if (breakpoint.disabled) {
      enableBreakpoint(breakpoint.location);
    } else {
      disableBreakpoint(breakpoint.location);
    }
  };

  isCurrentlyPausedAtBreakpoint() {
    const { frame, breakpoint, selectedSource } = this.props;
    if (!frame) {
      return false;
    }

    const bpId = getLocationWithoutColumn(
      getMappedLocation(breakpoint, selectedSource)
    );
    const frameId = getLocationWithoutColumn(
      getMappedLocation(frame, selectedSource)
    );

    return bpId == frameId;
  }

  getBreakpointLocation() {
    const { breakpoint, source, selectedSource } = this.props;
    const { column, line } = getMappedLocation(breakpoint, selectedSource);

    const isWasm = source && source.isWasm;
    const columnVal = features.columnBreakpoints && column ? `:${column}` : "";
    const bpLocation = isWasm
      ? `0x${line.toString(16).toUpperCase()}`
      : `${line}${columnVal}`;

    return bpLocation;
  }

  getBreakpointText() {
    const { selectedSource, breakpoint } = this.props;
    const { condition } = breakpoint;

    if (condition) {
      return condition;
    }

    if (selectedSource && isGeneratedId(selectedSource.id)) {
      return breakpoint.text;
    }

    return breakpoint.originalText;
  }

  highlightText() {
    const text = this.getBreakpointText();
    const codeMirror = getCodeMirror();

    if (!text || !codeMirror) {
      return { __html: "" };
    }

    const node = document.createElement("div");
    codeMirror.constructor.runMode(text, "application/javascript", node);
    return { __html: node.innerHTML };
  }

  render() {
    const { breakpoint } = this.props;

    return (
      <div
        className={classnames({
          breakpoint,
          paused: this.isCurrentlyPausedAtBreakpoint(),
          disabled: breakpoint.disabled,
          "is-conditional": !!breakpoint.condition
        })}
        onClick={this.selectBreakpoint}
        onContextMenu={this.onContextMenu}
      >
        <input
          type="checkbox"
          className="breakpoint-checkbox"
          checked={!breakpoint.disabled}
          onChange={this.handleBreakpointCheckbox}
          onClick={ev => ev.stopPropagation()}
        />
        <label
          className="breakpoint-label cm-s-mozilla"
          title={this.getBreakpointText()}
          dangerouslySetInnerHTML={this.highlightText()}
        />
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

const mapStateToProps = state => ({
  frame: getTopFrame(state),
  selectedSource: getSelectedSource(state)
});

export default connect(mapStateToProps, actions)(Breakpoint);
