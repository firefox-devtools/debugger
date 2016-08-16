const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
const Isvg = React.createFactory(require("react-inlinesvg"));
const classnames = require("classnames");
const actions = require("../actions");
const { getSource, getPause, getBreakpoints } = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const { truncateStr } = require("../utils/utils");
const { DOM: dom, PropTypes } = React;

require("./Breakpoints.css");

function isCurrentlyPausedAtBreakpoint(state, breakpoint) {
  const pause = getPause(state);
  if (!pause || pause.get("isInterrupted")) {
    return false;
  }

  const bpId = makeLocationId(breakpoint.location);
  const pausedId = makeLocationId(
    pause.getIn(["frame", "location"]).toJS()
  );

  return bpId === pausedId;
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
    if (breakpoint.loading) {
      return;
    }

    if (breakpoint.disabled) {
      this.props.enableBreakpoint(breakpoint.location);
    } else {
      this.props.disableBreakpoint(breakpoint.location);
    }
  },

  selectBreakpoint(breakpoint) {
    const sourceId = breakpoint.location.sourceId;
    const line = breakpoint.location.line;
    this.props.selectSource(sourceId, { line });
  },

  renderBreakpoint(breakpoint) {
    const snippet = truncateStr(breakpoint.text || "", 30);
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;

    const isPausedIcon = isCurrentlyPaused && Isvg({
      className: "pause-indicator",
      src: "images/pause-circle.svg"
    });

    return dom.div(
      {
        className: classnames({
          breakpoint,
          paused: isCurrentlyPaused,
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
        { className: "breakpoint-label", title: breakpoint.text },
        `${line} ${snippet}`
      ),
      isPausedIcon
    );
  },

  render() {
    const { breakpoints } = this.props;
    return dom.div(
      { className: "pane breakpoints-list" },
      (breakpoints.size === 0 ?
       dom.div({ className: "pane-info" }, "No Breakpoints") :
       breakpoints.valueSeq().map(bp => {
         return this.renderBreakpoint(bp);
       }))
    );
  }
});

function _getBreakpoints(state) {
  return getBreakpoints(state).map(bp => {
    const source = getSource(state, bp.location.sourceId);
    const isCurrentlyPaused = isCurrentlyPausedAtBreakpoint(state, bp);
    const locationId = makeLocationId(bp.location);

    bp = Object.assign({}, bp);
    bp.location.source = source;
    bp.locationId = locationId;
    bp.isCurrentlyPaused = isCurrentlyPaused;
    return bp;
  });
}

module.exports = connect(
  (state, props) => ({
    breakpoints: _getBreakpoints(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
