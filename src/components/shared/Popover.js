const React = require("react");
const { DOM: dom, PropTypes } = React;

require("./Popover.css");

const Popover = React.createClass({
  propTypes: {
    pos: PropTypes.object,
    // children: PropTypes.array
  },

  displayName: "Popover",

  render() {
    const { pos, children } = this.props;
    const left = pos ? pos.left : 0;
    const top = pos ? pos.top : 0;
    const shown = !!pos;

    return dom.div(
      {
        className: "popover",
        style: {
          display: shown ? "block" : "none",
          top: top,
          left: left
        }
      },
      children
    );
  }
});

module.exports = Popover;
