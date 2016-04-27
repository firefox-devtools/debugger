"use strict";

const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSource, isCurrentlyPausedAtBreakpoint, getBreakpoints, makeLocationId } = require("../selectors");
const ImPropTypes = require("react-immutable-proptypes");
const { DOM: dom, PropTypes } = React;

require("./Breakpoints.css");

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    enableBreakpoint: PropTypes.func.isRequired,
    disableBreakpoint: PropTypes.func.isRequired,
  },

  displayName: "Breakpoints",

  handleCheckbox(breakpoint) {
    const loc = breakpoint.get("location").toJS();

    if (breakpoint.get("disabled")) {
      this.props.enableBreakpoint(loc);
    } else {
      this.props.disableBreakpoint(loc);
    }
  },

  renderBreakpoint(breakpoint) {
    const filename = breakpoint.getIn(["location", "source", "filename"]);
    const locationId = breakpoint.get("locationId");
    const line = breakpoint.getIn(["location", "line"]);

    return dom.div(
      { className: "breakpoint",
        key: locationId },
      dom.input({ type: "checkbox",
                  checked: !breakpoint.get("disabled"),
                  onChange: () => this.handleCheckbox(breakpoint) }),
      `${filename}, line ${line}`
    );
  },

  render() {
    const { breakpoints } = this.props;

    return dom.div(
      { className: "breakpoints" },
      (breakpoints.size === 0 ?
       dom.div({ className: "pane-info" }, "No Breakpoints") :
       breakpoints.valueSeq().map(bp => {
         return this.renderBreakpoint(bp);
       }))
    );
  }
});

function _getBreakpoints(state) {
  return getBreakpoints(state).map(breakpoint => {
    const source = getSource(state, breakpoint.getIn(["location", "actor"]));
    const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(state, breakpoint);
    const locationId = makeLocationId(breakpoint.get("location").toJS());
    return breakpoint.setIn(["location", "source"], source)
                     .set("locationId", locationId)
                     .set("isCurrentlyPaused", isCurrentlyPaused);
  });
}

module.exports = connect(
  (state, props) => ({
    breakpoints: _getBreakpoints(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
