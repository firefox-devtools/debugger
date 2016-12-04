const React = require("react");
const { DOM: dom, PropTypes } = React;
const { div } = dom;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getEventListeners, getBreakpoint } = require("../selectors");
const CloseButton = require("./CloseButton");

require("./EventListeners.css");

function EventListeners({ selectSource, enableBreakpoint, disableBreakpoint, listeners }) {
}

const EventListeners = React.createClass({
  propTypes: {
    listeners: PropTypes.array
  },

  displayName: "EventListeners",

  renderListener({ type, selector, line, sourceId, breakpoint }) {
    const checked = breakpoint && !breakpoint.disabled;
    const location = { sourceId, line };

    return dom.div({
      className: "listener",
      onClick: () => this.props.selectSource(sourceId, { line }),
      key: `${type}`
    },
      dom.input({
        type: "checkbox",
        className: "listener-checkbox",
        checked,
        onChange: () => this.handleCheckbox(breakpoint, location),
      }),
      dom.span({ className: "type" }, type),
      dom.span({ className: "selector" }, selector),
      breakpoint ?
      CloseButton({
        handleClick: (ev) => this.removeBreakpoint(ev, breakpoint)
      }) : ""
    );
  },

  handleCheckbox(breakpoint, location) {
    if (!breakpoint) {
      return this.props.addBreakpoint(location);
    }

    if (breakpoint.loading) {
      return;
    }

    if (breakpoint.disabled) {
      this.props.enableBreakpoint(breakpoint.location);
    } else {
      this.props.disableBreakpoint(breakpoint.location);
    }
  },

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  },

  render() {
    const { listeners } = this.props;
    return dom.div({
      className: "pane event-listeners"
    },
      listeners.map(this.renderListener)
    );
  }
});

module.exports = connect(
  state => {
    const listeners = getEventListeners(state)
      .map(l => Object.assign({}, l, {
        breakpoint: getBreakpoint(state, { sourceId: l.sourceId, line: l.line })
      }));

    return { listeners };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(EventListeners);
