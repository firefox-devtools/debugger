// @flow
const React = require("react");
const { DOM: dom, PropTypes } = React;
require("./Dropdown.css");

const Dropdown = React.createClass({
  propTypes: {
    panel: PropTypes.object,
  },

  displayName: "Dropdown",

  getInitialState() {
    return {
      dropdownShown: false,
    };
  },

  toggleDropdown(e: SyntheticKeyboardEvent) {
    this.setState({
      dropdownShown: !this.state.dropdownShown,
    });
  },

  renderPanel() {
    return dom.div(
      {
        className: "dropdown",
        onClick: this.toggleDropdown,
        style: { display: this.state.dropdownShown ? "block" : "none" },
      },
      this.props.panel,
    );
  },

  renderButton() {
    return dom.button(
      {
        className: "dropdown-button",
        onClick: this.toggleDropdown,
      },
      "»",
    );
  },

  renderMask() {
    return dom.div({
      className: "dropdown-mask",
      onClick: this.toggleDropdown,
      style: { display: this.state.dropdownShown ? "block" : "none" },
    });
  },

  render() {
    return dom.div(
      { className: "dropdown-block" },
      this.renderPanel(),
      this.renderButton(),
      this.renderMask(),
    );
  },
});

module.exports = Dropdown;
