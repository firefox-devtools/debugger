/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";

import { CloseButton } from "../shared/Button";

import { createEditor, getLocationWithoutColumn } from "../../utils/breakpoint";
import { features } from "../../utils/prefs";
import { isInterrupted } from "../../utils/pause";

import type { LocalBreakpoint } from "./Breakpoints";
import type SourceEditor from "../../utils/editor/source-editor";
import type { Frame, Source, Why } from "../../types";

type Props = {
  breakpoint: LocalBreakpoint,
  selectedSource: ?Source,
  onClick: Function,
  onContextMenu: Function,
  onChange: Function,
  onCloseClick: Function,
  why: Why,
  frame: Frame
};

function getBreakpointLocation(source, line, column) {
  const isWasm = source && source.isWasm;
  const columnVal = features.columnBreakpoints && column ? `:${column}` : "";
  const bpLocation = isWasm
    ? `0x${line.toString(16).toUpperCase()}`
    : `${line}${columnVal}`;

  return bpLocation;
}

function getBreakpointText(selectedSource, breakpoint) {
  const { condition, text } = breakpoint;
  return condition || text;
}

function isCurrentlyPausedAtBreakpoint(
  breakpoint: LocalBreakpoint,
  frame: Frame,
  why: Why
) {
  if (!frame || isInterrupted(why)) {
    return false;
  }

  const bpId = getLocationWithoutColumn(breakpoint.location);
  const pausedId = getLocationWithoutColumn(frame.location);
  return bpId === pausedId;
}

class Breakpoint extends Component<Props> {
  editor: SourceEditor;

  componentDidMount() {
    this.setupEditor();
  }

  componentDidUpdate(prevProps: Props) {
    if (
      getBreakpointText(this.props.selectedSource, this.props.breakpoint) !=
      getBreakpointText(prevProps.selectedSource, prevProps.breakpoint)
    ) {
      this.destroyEditor();
    }
    this.setupEditor();
  }

  componentWillUnmount() {
    this.destroyEditor();
  }

  shouldComponentUpdate(nextProps: Props) {
    const prevBreakpoint = this.props.breakpoint;
    const nextBreakpoint = nextProps.breakpoint;

    return (
      !prevBreakpoint ||
      this.props.selectedSource != nextProps.selectedSource ||
      (prevBreakpoint.text != nextBreakpoint.text ||
        prevBreakpoint.disabled != nextBreakpoint.disabled ||
        prevBreakpoint.condition != nextBreakpoint.condition ||
        prevBreakpoint.hidden != nextBreakpoint.hidden ||
        prevBreakpoint.frame != nextBreakpoint.frame)
    );
  }

  destroyEditor() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  }

  setupEditor() {
    if (this.editor) {
      return;
    }

    const { selectedSource, breakpoint } = this.props;

    this.editor = createEditor(getBreakpointText(selectedSource, breakpoint));

    // disables the default search shortcuts
    // $FlowIgnore
    this.editor._initShortcuts = () => {};

    const node = ReactDOM.findDOMNode(this);
    if (node instanceof HTMLElement) {
      const mountNode = node.querySelector(".breakpoint-label");
      if (node instanceof HTMLElement) {
        // $FlowIgnore
        mountNode.innerHTML = "";
        this.editor.appendToLocalElement(mountNode);
        this.editor.codeMirror.on("mousedown", (_, e) => e.preventDefault());
      }
    }
  }

  renderCheckbox() {
    const { onChange, breakpoint } = this.props;
    const { disabled } = breakpoint;

    return (
      <input
        type="checkbox"
        className="breakpoint-checkbox"
        checked={!disabled}
        onChange={onChange}
        onClick={ev => ev.stopPropagation()}
      />
    );
  }

  renderText() {
    const { selectedSource, breakpoint } = this.props;
    const text = getBreakpointText(selectedSource, breakpoint);

    return (
      <label className="breakpoint-label" title={text}>
        {text}
      </label>
    );
  }

  renderLineClose() {
    const { breakpoint, onCloseClick } = this.props;
    const { location } = breakpoint;

    const { line, column } = location;

    return (
      <div className="breakpoint-line-close">
        <div className="breakpoint-line">
          {getBreakpointLocation(breakpoint.source, line, column)}
        </div>
        <CloseButton
          handleClick={onCloseClick}
          tooltip={L10N.getStr("breakpoints.removeBreakpointTooltip")}
        />
      </div>
    );
  }

  render() {
    const { breakpoint, onClick, onContextMenu, frame, why } = this.props;

    const locationId = breakpoint.locationId;
    const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(
      breakpoint,
      frame,
      why
    );
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
        {this.renderCheckbox()}
        {this.renderText()}
        {this.renderLineClose()}
      </div>
    );
  }
}

export default Breakpoint;
