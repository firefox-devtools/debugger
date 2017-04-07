const React = require("react");
const { DOM: dom, PropTypes, Component } = React;
const ReactDOM = require("react-dom");

require("./Popover.css");

class Popover extends Component {
  constructor() {
    super();
    this.state = {
      left: 0,
      top: 0
    };
  }

  componentDidMount() {
    const el = ReactDOM.findDOMNode(this);
    const { width, height } = el.getBoundingClientRect();
    const { type } = this.props;
    const {
      left: targetLeft,
      width: targetWidth,
      bottom: targetBottom,
      top: targetTop
    } = this.props.target.getBoundingClientRect();

    // width division corresponds to calc in Popover.css
    const left = targetLeft + targetWidth / 2 - width / 5;
    const top = targetBottom;

    if (type === "tooltip") {
      top = targetTop - height;
    }

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top });
  }

  renderPopover() {
    const { children, onMouseLeave } = this.props;
    const { top, left } = this.state;

    return dom.div(
      {
        className: "popover",
        onMouseLeave,
        style: { top, left }
      },
      dom.div({ className: "popover-gap" }),
      children
    );
  }

  renderTooltip() {
    const { children, onMouseLeave } = this.props;
    const { top, left } = this.state;

    return dom.div(
      {
        className: "tooltip-content",
        onMouseLeave,
        style: { top, left }
      },
      children
    );
  }

  render() {
    const { type } = this.props;

    if (type === "popover") {
      return this.renderPopover();
    }

    return this.renderTooltip();
  }
}

Popover.propTypes = {
  target: PropTypes.object,
  children: PropTypes.object,
  onMouseLeave: PropTypes.func,
  type: PropTypes.string
};

Popover.defaultProps = {
  onMouseLeave: () => {}
};

Popover.displayName = "Popover";

module.exports = Popover;
