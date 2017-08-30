// @flow
import React, { Component } from "react";
import "./Dropdown.css";

class Dropdown extends Component<{
  dropdownShown: boolean
}> {
  static defaultProps: {
    panel: Object
  };

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

  toggleDropdown(e: SyntheticKeyboardEvent<>) {
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

Dropdown.displayName = "Dropdown";

export default Dropdown;
