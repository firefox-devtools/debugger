const React = require("react");
const { DOM: dom, PropTypes, Component } = React;

require("./Popover.css");

class Popover extends Component {
  render() {
    const { pos, children, onMouseLeave } = this.props;
    const left = pos ? pos.left : 0;
    const top = pos ? pos.top : 0;
    const shown = !!pos;
    const display = shown ? "block" : "none";

    return dom.div(
      {
        className: "popover",
        onMouseLeave,
        style: { display, top, left }
      },
      children
    );
  }
}

Popover.propTypes = {
  pos: PropTypes.object,
  children: PropTypes.object,
  onMouseLeave: PropTypes.func
};

Popover.defaultProps = {
  onMouseLeave: () => {}
};

Popover.displayName = "Popover";

module.exports = Popover;
