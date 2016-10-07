const React = require("react");
const { DOM: dom, PropTypes } = React;

const Dropdown = React.createClass({
  propTypes: {
    panel: PropTypes.object
  },

  displayName: "Dropdown",

  getInitialState() {
    return {
      dropdownShown: false
    };
  },

  toggleSourcesDropdown(e) {
    this.setState({
      dropdownShown: !this.state.dropdownShown,
    });
  },

  renderPanel() {
    return dom.div(
      {
        className: "sources-dropdown dropdown",
        onClick: this.toggleSourcesDropdown,
        ref: "sourcesDropdown",
        style: { display: (this.state.dropdownShown ? "block" : "none") }
      },
      this.props.panel
    );
  },

  renderButton() {
    return dom.span(
      {
        className: "subsettings",
        onClick: this.toggleSourcesDropdown
      },
      dom.img({ src: "images/subSettings.svg" })
    );
  },

  renderMask() {
    return dom.div({
      className: "dropdown-mask",
      onClick: this.toggleSourcesDropdown,
      style: { display: (this.state.dropdownShown ? "block" : "none") }
    });
  },

  render() {
    return dom.div({},
      this.renderPanel(),
      this.renderButton(),
      this.renderMask()
    );
  }

});

module.exports = Dropdown;
