"use strict";

const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
const Isvg = React.createFactory(require("react-inlinesvg"));
const classnames = require("classnames");
const actions = require("../actions");
const { getSource, getPause, getBreakpoints, makeLocationId } = require("../selectors");
const { truncateStr } = require("../util/utils");
const { DOM: dom, PropTypes } = React;

require("./Breakpoints.css");

function isCurrentlyPausedAtBreakpoint(state, breakpoint) {
  const pause = getPause(state);

  if (!pause || pause.get("isInterrupted")) {
    return false;
  }

  const breakpointLocation = makeLocationId(breakpoint.get("location").toJS());
  const pauseLocation = makeLocationId(
    pause.getIn(["frame", "location"]).toJS()
  );

  return breakpointLocation == pauseLocation;
}

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    enableBreakpoint: PropTypes.func.isRequired,
    disableBreakpoint: PropTypes.func.isRequired,
    selectSource: PropTypes.func.isRequired
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

  selectBreakpoint(breakpoint) {
    const sourceId = breakpoint.getIn(["location", "sourceId"]);
    const line = breakpoint.getIn(["location", "line"]);
    this.props.selectSource(sourceId, { line });
  },

  renderBreakpoint(breakpoint) {
    const snippet = truncateStr(breakpoint.get("text") || "", 30);
    const locationId = breakpoint.get("locationId");
    const line = breakpoint.getIn(["location", "line"]);
    const isCurrentlyPaused = breakpoint.get("isCurrentlyPaused");
    const isDisabled = breakpoint.get("disabled");

    const isPausedIcon = isCurrentlyPaused && Isvg({
      className: "pause-indicator",
      src: "images/pause-circle.svg"
    });

    return dom.div(
      {
        className: classnames({
          breakpoint: true,
          disabled: isDisabled
        }),
        key: locationId,
        onClick: () => this.selectBreakpoint(breakpoint)
      },
      dom.input(
        {
          type: "checkbox",
          checked: !isDisabled,
          onChange: () => this.handleCheckbox(breakpoint)
        }),
      dom.div(
        { className: "breakpoint-label", title: breakpoint.get("text") },
        `${line} ${snippet}`
      ),
      isPausedIcon
    );
  },

  render() {
    const { breakpoints } = this.props;
    return dom.div(
      { className: "breakpoints-list" },
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
    const source = getSource(state, breakpoint.getIn(["location", "sourceId"]));
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
