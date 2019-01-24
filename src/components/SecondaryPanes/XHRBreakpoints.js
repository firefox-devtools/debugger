/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "../../utils/connect";
import classnames from "classnames";
import actions from "../../actions";

import { CloseButton } from "../shared/Button";

import "./XHRBreakpoints.css";
import { getXHRBreakpoints, shouldPauseOnAnyXHR } from "../../selectors";
import ExceptionOption from "./Breakpoints/ExceptionOption";

import type { XHRBreakpointsList } from "../../reducers/types";

type Props = {
  xhrBreakpoints: XHRBreakpointsList,
  shouldPauseOnAny: boolean,
  showInput: boolean,
  onXHRAdded: Function,
  setXHRBreakpoint: Function,
  removeXHRBreakpoint: typeof actions.removeXHRBreakpoint,
  enableXHRBreakpoint: typeof actions.enableXHRBreakpoint,
  disableXHRBreakpoint: typeof actions.disableXHRBreakpoint,
  togglePauseOnAny: typeof actions.togglePauseOnAny,
  updateXHRBreakpoint: typeof actions.updateXHRBreakpoint
};

type State = {
  editing: boolean,
  inputValue: string,
  inputMethod: string,
  editIndex: number,
  focused: boolean,
  clickedOnOptions: boolean
};

// At present, the "Pause on any URL" checkbox creates an xhrBreakpoint
// of "ANY" with no path, so we can remove that before creating the list
function getExplicitXHRBreakpoints(xhrBreakpoints) {
  return xhrBreakpoints.filter(bp => bp.path !== "");
}

const xhrMethods = [
  "ANY",
  "GET",
  "POST",
  "PUT",
  "HEAD",
  "DELETE",
  "PATCH",
  "OPTIONS"
];

class XHRBreakpoints extends Component<Props, State> {
  _input: ?HTMLInputElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      editing: false,
      inputValue: "",
      inputMethod: "ANY",
      focused: false,
      editIndex: -1,
      clickedOnOptions: false
    };
  }

  componentDidMount() {
    const { showInput } = this.props;

    // Ensures that the input is focused when the "+"
    // is clicked while the panel is collapsed
    if (this._input && showInput) {
      this._input.focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const input = this._input;

    if (!input) {
      return;
    }

    if (!prevState.editing && this.state.editing) {
      input.setSelectionRange(0, input.value.length);
      input.focus();
    } else if (this.props.showInput && !this.state.focused) {
      input.focus();
    }
  }

  handleNewSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.setXHRBreakpoint(this.state.inputValue, this.state.inputMethod);

    this.hideInput();
  };

  handleExistingSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { editIndex, inputValue, inputMethod } = this.state;
    const { xhrBreakpoints } = this.props;
    const { path, method } = xhrBreakpoints[editIndex];

    if (path !== inputValue || method != inputMethod) {
      this.props.updateXHRBreakpoint(editIndex, inputValue, inputMethod);
    }

    this.hideInput();
  };

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const target = e.target;
    this.setState({ inputValue: target.value });
  };

  handleMethodChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const target = e.target;
    this.setState({
      focused: true,
      editing: true,
      inputMethod: target.value
    });
  };

  hideInput = () => {
    if (this.state.clickedOnOptions) {
      this.setState({
        focused: true,
        clickedOnOptions: false
      });
    } else {
      this.setState({
        focused: false,
        editing: false,
        editIndex: -1,
        inputValue: "",
        inputMethod: "ANY"
      });
      this.props.onXHRAdded();
    }
  };

  keepFocusOnInputButNoEdit = () => {
    this.setState({ focused: true, editing: false });
  };

  onFocus = () => {
    this.setState({ focused: true, editing: true });
  };

  onMouseDown = e => {
    if (this.state.clickedOnOptions) {
      return;
    }
    this.setState({ editing: false, clickedOnOptions: true });
  };

  editExpression = index => {
    const { xhrBreakpoints } = this.props;
    const { path, method } = xhrBreakpoints[index];
    this.setState({
      inputValue: path,
      inputMethod: method,
      editing: true,
      editIndex: index
    });
  };

  renderXHRInput(onSubmit) {
    const { focused, inputValue } = this.state;
    const placeholder = L10N.getStr("xhrBreakpoints.placeholder");

    return (
      <li
        className={classnames("xhr-input-container", { focused })}
        key="xhr-input-container"
      >
        <form className="xhr-input-form" onSubmit={onSubmit}>
          <input
            className="xhr-input-url"
            type="text"
            placeholder={placeholder}
            onChange={this.handleChange}
            onBlur={this.hideInput}
            onFocus={this.onFocus}
            value={inputValue}
            ref={c => (this._input = c)}
          />
          {focused && this.renderMethodSelectElement()}
          <input type="submit" style={{ display: "none" }} />
        </form>
      </li>
    );
  }

  handleCheckbox = index => {
    const {
      xhrBreakpoints,
      enableXHRBreakpoint,
      disableXHRBreakpoint
    } = this.props;
    const breakpoint = xhrBreakpoints[index];
    if (breakpoint.disabled) {
      enableXHRBreakpoint(index);
    } else {
      disableXHRBreakpoint(index);
    }
  };

  renderBreakpoint = breakpoint => {
    const { path, disabled, method } = breakpoint;
    const { editIndex } = this.state;
    const { removeXHRBreakpoint, xhrBreakpoints } = this.props;

    // The "pause on any" checkbox
    if (!path) {
      return;
    }

    // Finds the xhrbreakpoint so as to not make assumptions about position
    const index = xhrBreakpoints.findIndex(
      bp => bp.path === path && bp.method === method
    );

    if (index === editIndex) {
      return this.renderXHRInput(this.handleExistingSubmit);
    }

    return (
      <li
        className="xhr-container"
        key={path}
        title={path}
        onDoubleClick={(items, options) => this.editExpression(index)}
      >
        <label>
          <input
            type="checkbox"
            className="xhr-checkbox"
            checked={!disabled}
            onChange={() => this.handleCheckbox(index)}
            onClick={ev => ev.stopPropagation()}
          />
          <div className="xhr-label-method">{method}</div>
          <div className="xhr-label-url">{path}</div>
          <div className="xhr-container__close-btn">
            <CloseButton handleClick={e => removeXHRBreakpoint(index)} />
          </div>
        </label>
      </li>
    );
  };

  renderBreakpoints = () => {
    const { showInput, xhrBreakpoints } = this.props;
    const explicitXhrBreakpoints = getExplicitXHRBreakpoints(xhrBreakpoints);

    return (
      <ul className="pane expressions-list">
        {explicitXhrBreakpoints.map(this.renderBreakpoint)}
        {(showInput || explicitXhrBreakpoints.length === 0) &&
          this.renderXHRInput(this.handleNewSubmit)}
      </ul>
    );
  };

  renderCheckbox = () => {
    const { shouldPauseOnAny, togglePauseOnAny, xhrBreakpoints } = this.props;
    const explicitXhrBreakpoints = getExplicitXHRBreakpoints(xhrBreakpoints);

    return (
      <div
        className={classnames("breakpoints-exceptions-options", {
          empty: explicitXhrBreakpoints.length === 0
        })}
      >
        <ExceptionOption
          className="breakpoints-exceptions"
          label={L10N.getStr("pauseOnAnyXHR")}
          isChecked={shouldPauseOnAny}
          onChange={() => togglePauseOnAny()}
        />
      </div>
    );
  };

  renderMethodOption = method => {
    return (
      <option
        key={method}
        value={method}
        // e.stopPropagation() required here since otherwise Firefox triggers 2x
        // onMouseDown events on <select> upon clicking on an <option>
        onMouseDown={e => e.stopPropagation()}
      >
        {method}
      </option>
    );
  };

  renderMethodSelectElement = () => {
    return (
      <select
        value={this.state.inputMethod}
        className={"xhr-input-method"}
        onChange={this.handleMethodChange}
        onClick={this.keepFocusOnInputButNoEdit}
        onMouseDown={this.onMouseDown}
      >
        {xhrMethods.map(this.renderMethodOption)}
      </select>
    );
  };

  render() {
    return (
      <div>
        {this.renderCheckbox()}
        {this.renderBreakpoints()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    xhrBreakpoints: getXHRBreakpoints(state),
    shouldPauseOnAny: shouldPauseOnAnyXHR(state)
  };
};

export default connect(
  mapStateToProps,
  {
    setXHRBreakpoint: actions.setXHRBreakpoint,
    removeXHRBreakpoint: actions.removeXHRBreakpoint,
    enableXHRBreakpoint: actions.enableXHRBreakpoint,
    disableXHRBreakpoint: actions.disableXHRBreakpoint,
    updateXHRBreakpoint: actions.updateXHRBreakpoint,
    togglePauseOnAny: actions.togglePauseOnAny
  }
)(XHRBreakpoints);

export { xhrMethods };
