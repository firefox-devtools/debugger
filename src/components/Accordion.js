const React = require("react");
const { DOM: dom, PropTypes } = React;
const Svg = require("./utils/Svg");

require("./Accordion.css");

const Accordion = React.createClass({
  propTypes: {
    children: PropTypes.array.object
  },

  displayName: "Accordion",

  render() {
    return dom.div(
      { className: "accordion" },
      this.props.children
    );
  }
});

const AccordionPane = React.createClass({
  propTypes: {
    item: PropTypes.object,
    opened: PropTypes.bool,
    children: PropTypes.array,
    buttons: PropTypes.object,
    header: PropTypes.string
  },

  displayName: "AccordionPane",

  getInitialState: function() {
    return {
      opened: this.props.opened
    };
  },

  handleHeaderClick: function() {
    const opened = this.state.opened;
    opened = !opened;
    this.setState({ opened });
  },

  renderButtons(buttons) {
    if (!buttons) {
      return null;
    }

    return dom.span(
      { className: "header-buttons" },
      buttons
    );
  },

  renderContent() {
    const opened = this.state.opened;
    const children = this.props.children;

    if (!opened) {
      return null;
    }

    return dom.div(
      { className: "_content",
        style: { display: opened ? "block" : "none" }
      },
      children
    );
  },

  render: function() {
    const { buttons, header } = this.props;
    const { opened } = this.state;

    const containerClassName =
          header.toLowerCase().replace(/\s/g, "-") + "-pane";

    return dom.div(
      { className: containerClassName },

      dom.div(
        { className: "_header",
          onClick: this.handleHeaderClick
        },
        Svg("arrow", { className: opened ? "expanded" : "" }),
        header,
        this.renderButtons(buttons)
      ),
      this.renderContent()
    );
  }
});

module.exports = {
  AccordionPane,
  Accordion
};
