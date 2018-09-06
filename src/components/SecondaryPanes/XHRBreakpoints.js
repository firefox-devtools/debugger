/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import actions from "../../actions";

import { CloseButton } from "../shared/Button";

import "./XHRBreakpoints.css";
import { getXHRBreakpoints } from "../../selectors";

import type { XHRBreakpointsMap } from "../../reducers/types";

type Props = {
  xhrBreakpoints: XHRBreakpointsMap,
  showInput: boolean,
  onXHRAdded: Function,
  setXHRBreakpoint: Function,
  removeXHRBreakpoint: typeof actions.removeXHRBreakpoint,
  enableXHRBreakpoint: typeof actions.enableXHRBreakpoint,
  disableXHRBreakpoint: typeof actions.disableXHRBreakpoint
};

type State = {
  editing: boolean,
  inputValue: string,
  editIndex: number,
  previousInput: string,
  focused: boolean
};

class XHRBreakpoints extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editing: false,
      inputValue: "",
      previousInput: "",
      focused: false,
      editIndex: -1
    };
  }

  handleNewSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.setXHRBreakpoint(this.state.inputValue);

    this.hideInput();
  };

  handleExistingSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { previousInput, inputValue } = this.state;

    if (previousInput !== inputValue) {
      this.props.removeXHRBreakpoint(previousInput);
      this.props.setXHRBreakpoint(inputValue);
    }

    this.hideInput();
  };

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const target = e.target;
    this.setState({ inputValue: target.value });
  };

  hideInput = () => {
    this.setState({
      focused: false,
      editing: false,
      editIndex: -1,
      previousInput: "",
      inputValue: ""
    });
    this.props.onXHRAdded();
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  editExpression = (contains, index) => {
    this.setState({
      inputValue: contains,
      previousInput: contains,
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
        key="xhr-input"
      >
        <form className="xhr-input-form" onSubmit={onSubmit}>
          <input
            className="xhr-input"
            type="text"
            placeholder={placeholder}
            onChange={this.handleChange}
            onBlur={this.hideInput}
            onFocus={this.onFocus}
            autoFocus={true}
            value={inputValue}
          />
          <input type="submit" style={{ display: "none" }} />
        </form>
      </li>
    );
  }
  handleCheckbox = contains => {
    const {
      xhrBreakpoints,
      enableXHRBreakpoint,
      disableXHRBreakpoint
    } = this.props;
    const breakpoint = xhrBreakpoints.get(contains);
    if (breakpoint.disabled) {
      enableXHRBreakpoint(breakpoint);
    } else {
      disableXHRBreakpoint(breakpoint);
    }
  };

  deleteBreakpoint(e, breakpoint) {}

  renderBreakpoint = ([contains, { text, disabled }], index) => {
    const { editIndex } = this.state;
    const { removeXHRBreakpoint } = this.props;

    if (index === editIndex) {
      return this.renderXHRInput(this.handleExistingSubmit);
    }

    return (
      <li
        className="xhr-container"
        key={contains}
        title={contains}
        onDoubleClick={(items, options) => this.editExpression(contains, index)}
      >
        <input
          type="checkbox"
          className="xhr-checkbox"
          checked={!disabled}
          onChange={() => this.handleCheckbox(contains)}
          onClick={ev => ev.stopPropagation()}
        />
        <div className="xhr-label">{text}</div>
        <div className="xhr-container__close-btn">
          <CloseButton handleClick={e => removeXHRBreakpoint(contains)} />
        </div>
      </li>
    );
  };

  render() {
    const { showInput, xhrBreakpoints } = this.props;
    const breakpoints = xhrBreakpoints.entrySeq();
    return (
      <ul className="pane expressions-list">
        {breakpoints.map(this.renderBreakpoint)}
        {(showInput || !xhrBreakpoints.size) &&
          this.renderXHRInput(this.handleNewSubmit)}
      </ul>
    );
  }
}

const mapStateToProps = state => {
  return {
    xhrBreakpoints: getXHRBreakpoints(state)
  };
};

export default connect(
  mapStateToProps,
  {
    setXHRBreakpoint: actions.setXHRBreakpoint,
    removeXHRBreakpoint: actions.removeXHRBreakpoint,
    enableXHRBreakpoint: actions.enableXHRBreakpoint,
    disableXHRBreakpoint: actions.disableXHRBreakpoint
  }
)(XHRBreakpoints);
