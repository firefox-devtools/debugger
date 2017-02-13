import React from "react";
const { DOM: dom, PropTypes } = React;
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { getEventListeners, getBreakpoint } from "../../selectors";
import CloseButton from "../shared/Button/Close";
import "./EventListeners.css";

const EventListeners = React.createClass({
  propTypes: {
    listeners: PropTypes.array,
    selectSource: PropTypes.func,
    addBreakpoint: PropTypes.func,
    enableBreakpoint: PropTypes.func,
    disableBreakpoint: PropTypes.func,
    removeBreakpoint: PropTypes.func
  },

  displayName: "EventListeners",

  renderListener({ type, selector, line, sourceId, breakpoint }) {
    const checked = breakpoint && !breakpoint.disabled;
    const location = { sourceId, line };

    return dom.div({
      className: "listener",
      onClick: () => this.props.selectSource(sourceId, { line }),
      key: `${type}.${selector}.${sourceId}.${line}`
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

export default connect(
  state => {
    const listeners = getEventListeners(state)
      .map(l => Object.assign({}, l, {
        breakpoint: getBreakpoint(state, { sourceId: l.sourceId, line: l.line })
      }));

    return { listeners };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(EventListeners);
