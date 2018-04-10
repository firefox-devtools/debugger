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

class Breakpoint extends Component<Props> {
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
      this.editor = null;
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    const prevBreakpoint = this.props.breakpoint;
    const nextBreakpoint = nextProps.breakpoint;

    return (
      !prevBreakpoint ||
      (prevBreakpoint.text != nextBreakpoint.text ||
        prevBreakpoint.disabled != nextBreakpoint.disabled ||
        prevBreakpoint.condition != nextBreakpoint.condition ||
        prevBreakpoint.hidden != nextBreakpoint.hidden ||
        prevBreakpoint.isCurrentlyPaused != nextBreakpoint.isCurrentlyPaused)
    );
  }

  getBreakpointText() {
    const { breakpoint } = this.props;

    return breakpoint.condition || breakpoint.text;
  }

  setupEditor() {
    if (this.editor) {
      return;
    }

    this.editor = createEditor(this.getBreakpointText());

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
    const text = this.getBreakpointText();

    return (
      <label className="breakpoint-label" title={text}>
        {text}
      </label>
    );
  }

  renderLineClose() {
    const { breakpoint, onCloseClick } = this.props;
    const { line, column } = breakpoint.location;

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
    const { breakpoint, onClick, onContextMenu } = this.props;

    const locationId = breakpoint.locationId;
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
        {this.renderCheckbox()}
        {this.renderText()}
        {this.renderLineClose()}
      </div>
    );
  }
}

export default Breakpoint;
