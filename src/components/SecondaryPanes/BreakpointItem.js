/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";

import CloseButton from "../shared/Button/Close";

import { createEditor } from "../../utils/breakpoint";
import { features } from "../../utils/prefs";

import type { LocalBreakpoint } from "./Breakpoints";
import type SourceEditor from "../../utils/editor/source-editor";

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
  editor: SourceEditor;

  componentDidMount() {
    this.setupEditor();
  }
  componentDidUpdate() {
    this.setupEditor();
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    // This is needed, IMO, so we don't need to create
    // loads of CM instances for no reason
    return this.props.breakpoint != nextProps.breakpoint;
  }

  setupEditor() {
    const { breakpoint } = this.props;
    this.editor = createEditor(breakpoint.text);

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
      }
    }
  }

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
            {getBreakpointLocation(breakpoint.source, line, column)}
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
