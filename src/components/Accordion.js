const React = require("react");
const { DOM: dom, PropTypes } = React;

const { div } = dom;
const Svg = require("./utils/Svg");

require("./Accordion.css");

const Accordion = React.createClass({
  propTypes: {
    items: PropTypes.array
  },

  displayName: "Accordion",

  getInitialState: function() {
    return { opened: this.props.items.map(item => item.opened),
      created: [] };
  },

  handleHeaderClick: function(i) {
    const opened = [...this.state.opened];
    const created = [...this.state.created];
    const item = this.props.items[i];

    opened[i] = !opened[i];
    created[i] = true;

    if (opened[i] && item.onOpened) {
      item.onOpened();
    }

    this.setState({ opened, created });
  },

  renderContainer: function(item, i) {
    const { opened, created } = this.state;
    const containerClassName =
      `${item.header.toLowerCase().replace(/\s/g, "-")}-pane`;

    return div(
      { className: containerClassName, key: i },

      div(
        { className: "_header",
          onClick: () => this.handleHeaderClick(i) },
        Svg("arrow", { className: opened[i] ? "expanded" : "" }),
        item.header,
        item.buttons ?
        dom.span({ className: "header-buttons" }, item.buttons) : null
      ),

      (created[i] || opened[i]) ?
        div(
          { className: "_content",
            style: { display: opened[i] ? "block" : "none" }
          },
          React.createElement(item.component, item.componentProps || {})
        ) :
        null
    );
  },

  render: function() {
    return div(
      { className: "accordion" },
      this.props.items.map(this.renderContainer)
    );
  }
});

module.exports = Accordion;
