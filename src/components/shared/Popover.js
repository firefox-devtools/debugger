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
    const { left, top } = type == "popover"
      ? this.getPopoverCoords()
      : this.getTooltipCoords();

    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ left, top });
  }

  getPopoverCoords() {
    const el = ReactDOM.findDOMNode(this);
    const { width } = el.getBoundingClientRect();
    const {
      left: targetLeft,
      width: targetWidth,
      bottom: targetBottom
    } = this.props.target.getBoundingClientRect();

    // width division corresponds to calc in Popover.css
    let left = targetLeft + targetWidth / 2 - width / 5;
    let top = targetBottom;
    return { left, top };
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
    const top = targetTop - height - 4;

    return { left, top };
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
