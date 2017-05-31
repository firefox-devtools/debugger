// @flow
import { DOM as dom, Component } from "react";
import "./Dropdown.css";

class Dropdown extends Component {
  props: {
    panel: Object
  };
  state: {
    dropdownShown: boolean
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

  toggleDropdown(e: SyntheticKeyboardEvent) {
    this.setState({
      dropdownShown: !this.state.dropdownShown
    });
  }

  renderPanel() {
    return dom.div(
      {
        className: "dropdown",
        onClick: this.toggleDropdown,
        style: { display: this.state.dropdownShown ? "block" : "none" }
      },
      this.props.panel
    );
  }

  renderButton() {
    return dom.button(
      {
        className: "dropdown-button",
        onClick: this.toggleDropdown
      },
      "»"
    );
  }

  renderMask() {
    return dom.div({
      className: "dropdown-mask",
      onClick: this.toggleDropdown,
      style: { display: this.state.dropdownShown ? "block" : "none" }
    });
  }

  render() {
    return dom.div(
      { className: "dropdown-block" },
      this.renderPanel(),
      this.renderButton(),
      this.renderMask()
    );
  }
}

Dropdown.displayName = "Dropdown";

export default Dropdown;
