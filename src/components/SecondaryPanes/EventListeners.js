// @flow
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { getEventListeners, getBreakpoint } from "../../selectors";
import CloseButton from "../shared/Button/Close";
import "./EventListeners.css";

import type { Breakpoint, Location, SourceId } from "debugger-html";

type Listener = {
  selector: string,
  type: string,
  sourceId: SourceId,
  line: number,
  breakpoint: ?Breakpoint
};

type Props = {
  listeners: Array<Listener>,
  selectSource: (SourceId, { line: number }) => void,
  addBreakpoint: ({ sourceId: SourceId, line: number }) => void,
  enableBreakpoint: Location => void,
  disableBreakpoint: Location => void,
  removeBreakpoint: Location => void
};

class EventListeners extends Component<Props> {
  renderListener: Function;

  constructor(...args) {
    super(...args);

    this.renderListener = this.renderListener.bind(this);
  }

  renderListener({ type, selector, line, sourceId, breakpoint }) {
    const checked = breakpoint && !breakpoint.disabled;
    const location = { sourceId, line };

    return (
      <div
        className="listener"
        onClick={() => this.props.selectSource(sourceId, { line })}
        key={`${type}.${selector}.${sourceId}.${line}`}
      >
        <input
          type="checkbox"
          className="listener-checkbox"
          checked={checked}
          onChange={() => this.handleCheckbox(breakpoint, location)}
        />
        <span className="type">
          {type}
        </span>
        <span className="selector">
          {selector}
        </span>
        {breakpoint
          ? <CloseButton
              handleClick={ev => this.removeBreakpoint(ev, breakpoint)}
            />
          : ""}
      </div>
    );
  }

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
  }

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  }

  render() {
    const { listeners } = this.props;
    return (
      <div className="pane event-listeners">
        {listeners.map(this.renderListener)}
      </div>
    );
  }
}

EventListeners.displayName = "EventListeners";

export default connect(
  state => {
    const listeners = getEventListeners(state).map(l =>
      Object.assign({}, l, {
        breakpoint: getBreakpoint(state, {
          sourceId: l.sourceId,
          line: l.line
        })
      })
    );

    return { listeners };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(EventListeners);
