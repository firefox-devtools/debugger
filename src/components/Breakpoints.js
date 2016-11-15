const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const actions = require("../actions");
const { getSource, getPause, getBreakpoints } = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const { truncateStr } = require("../utils/utils");
const { DOM: dom, PropTypes } = React;
const { endTruncateStr } = require("../utils/utils");
const { basename } = require("../utils/path");
const CloseButton = require("./CloseButton");

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

function renderSourceLocation(source, line) {
  const url = source.get("url") ? basename(source.get("url")) : null;
  // const line = url !== "" ? `: ${line}` : "";
  return url ?
    dom.div(
      { className: "location" },
      `${endTruncateStr(url, 30)}: ${line}`
    ) : null;
}

const Breakpoints = React.createClass({
  propTypes: {
    breakpoints: ImPropTypes.map.isRequired,
    enableBreakpoint: PropTypes.func.isRequired,
    disableBreakpoint: PropTypes.func.isRequired,
    selectSource: PropTypes.func.isRequired,
    removeBreakpoint: PropTypes.func.isRequired
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

  removeBreakpoint(event, breakpoint) {
    event.stopPropagation();
    this.props.removeBreakpoint(breakpoint.location);
  },

  renderBreakpoint(breakpoint) {
    const snippet = truncateStr(breakpoint.text || "", 30);
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;

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
      dom.input({
        type: "checkbox",
        className: "breakpoint-checkbox",
        checked: !isDisabled,
        onChange: () => this.handleCheckbox(breakpoint),
        // Prevent clicking on the checkbox from triggering the onClick of
        // the surrounding div
        onClick: (ev) => ev.stopPropagation()
      }),
      dom.div(
        { className: "breakpoint-label", title: breakpoint.text },
        dom.div({}, renderSourceLocation(breakpoint.location.source, line))
      ),
      dom.div({ className: "breakpoint-snippet" }, snippet),
      CloseButton({
        handleClick: (ev) => this.removeBreakpoint(ev, breakpoint)
      }));
  },

  render() {
    const { breakpoints } = this.props;
    return dom.div(
      { className: "pane breakpoints-list" },
      (breakpoints.size === 0 ?
       dom.div({ className: "pane-info" }, L10N.getStr("breakpoints.none")) :
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
  })
  .filter(bp => bp.location.source);
}

module.exports = connect(
  (state, props) => ({
    breakpoints: _getBreakpoints(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
