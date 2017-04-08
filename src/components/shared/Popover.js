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
    const { type } = this.props;
    const { left, top, dir } = type == "popover"
      ? this.getPopoverCoords()
      : this.getTooltipCoords();

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top, dir });
  }

  getPopoverCoords() {
    const el = ReactDOM.findDOMNode(this);
    const { width, height } = el.getBoundingClientRect();
    const {
      left: targetLeft,
      width: targetWidth,
      bottom: targetBottom,
      top: targetTop
    } = this.props.target.getBoundingClientRect();

    // width division corresponds to calc in Popover.css
    const left = targetLeft + targetWidth / 2 - width / 5;
    const dir = targetBottom + height > window.innerHeight ? "up" : "down";
    const top = dir == "down" ? targetBottom : targetTop - height;

    return { left, top, dir };
  }

  getTooltipCoords() {
    const el = ReactDOM.findDOMNode(this);
    const { height } = el.getBoundingClientRect();
    const {
      left: targetLeft,
      width: targetWidth,
      top: targetTop
    } = this.props.target.getBoundingClientRect();

    const left = targetLeft + targetWidth / 4;
    const top = targetTop - height;

    return { left, top, dir: "up" };
  }

  renderPopover() {
    const { children, onMouseLeave } = this.props;
    const { top, left, dir } = this.state;

    if (dir === "up") {
      return dom.div(
        {
          className: "popover popover-up",
          onMouseLeave,
          style: { top, left }
        },
        children,
        dom.div({ className: "popover-gap" })
      );
    }

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
      children,
      dom.div({ className: "tooltip-gap" })
    );
  }

  render() {
    const { type } = this.props;

    if (type === "tooltip") {
      return this.renderTooltip();
    }

    return this.renderPopover();
  }
}

Popover.propTypes = {
  target: PropTypes.object,
  children: PropTypes.object,
  onMouseLeave: PropTypes.func,
  type: PropTypes.string
};

Popover.defaultProps = {
  onMouseLeave: () => {},
  type: "popover"
};

Popover.displayName = "Popover";

module.exports = Popover;
