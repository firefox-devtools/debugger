/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import "./Dropdown.css";

type Props = {
  panel: Object
};

type State = {
  dropdownShown: boolean
};

class Dropdown extends Component<Props, State> {
  toggleDropdown: Function;
  renderPanel: Function;
  renderButton: Function;
  renderMask: Function;

  constructor(props: any) {
    super(props);
    this.state = {
      dropdownShown: false
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.renderPanel = this.renderPanel.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderMask = this.renderMask.bind(this);
  }

  toggleDropdown(e: SyntheticKeyboardEvent<HTMLElement>) {
    this.setState({
      dropdownShown: !this.state.dropdownShown
    });
  }

  renderPanel() {
    return (
      <div
        className="dropdown"
        onClick={this.toggleDropdown}
        style={{ display: this.state.dropdownShown ? "block" : "none" }}
      >
        {this.props.panel}
      </div>
    );
  }

  renderButton() {
    return (
      <button className="dropdown-button" onClick={this.toggleDropdown}>
        »
      </button>
    );
  }

  renderMask() {
    return (
      <div
        className="dropdown-mask"
        onClick={this.toggleDropdown}
        style={{ display: this.state.dropdownShown ? "block" : "none" }}
      />
    );
  }

  render() {
    return (
      <div className="dropdown-block">
        {this.renderPanel()}
        {this.renderButton()}
        {this.renderMask()}
      </div>
    );
  }
}

export default Dropdown;
