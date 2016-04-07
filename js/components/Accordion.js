const React = require("react");
const dom = React.DOM;
const { div } = dom;

require("./accordion.css");

const Accordion = React.createClass({
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

    if(opened[i] && item.onOpened) {
      item.onOpened();
    }

    this.setState({ opened, created });
  },

  render: function() {
    const { opened, created } = this.state;
    return div(
      { className: "accordion" },
      this.props.items.map((item, i) => {
        return div(
          { className: opened[i] ? "opened" : "" },
          div({ className: "_header",
                onClick: () => this.handleHeaderClick(i) }, item.header),

          (created[i] || opened[i]) ?
            div({ className: "_content",
                  style: { display: opened[i] ? "block" : "none" }
                },
                React.createElement(item.component, item.componentProps || {})) :
            null
        )
      })
    );
  }
});

module.exports = Accordion;
