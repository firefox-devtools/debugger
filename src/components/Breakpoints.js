const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const actions = require("../actions");
const {
  getSource,
  getPause,
  getBreakpoints,
  getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions,
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const { truncateStr } = require("../utils/utils");
const { DOM: dom, PropTypes } = React;
const { endTruncateStr } = require("../utils/utils");
const { basename } = require("../utils/path");
const CloseButton = require("./CloseButton");
const CommandBar = React.createFactory(require("./CommandBar"));

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
    removeBreakpoint: PropTypes.func.isRequired,
    pauseOnExceptions: PropTypes.func.isRequired,
    exceptionPauseModes: PropTypes.array.isRequired,
    currentExceptionPauseMode: PropTypes.object.isRequired,
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

  pauseExceptionModeToggled(event) {
    const { pauseOnExceptions, exceptionPauseModes } = this.props;
    const targetMode = exceptionPauseModes.filter(
      item => item.mode === event.target.value
    )[0];

    pauseOnExceptions(targetMode.shouldPause, targetMode.shouldIgnoreCaught);
  },

  renderGlobalBreakpoints() {
    const { currentExceptionPauseMode } = this.props;
    const _createToggle = (fromMode) => {
      return dom.label({
        className: "breakpoint",
        key: fromMode.mode,
      },
      dom.input({
        type: "radio",
        onChange: this.pauseExceptionModeToggled,
        value: fromMode.mode,
        checked: currentExceptionPauseMode.mode === fromMode.mode,
      }),
        dom.div({
          className: "breakpoint-label"
        }, fromMode.label)
      );
    };

    return dom.details({},
      dom.summary({},
        `Exceptions - Pausing on: ${currentExceptionPauseMode.headerLabel}`
      ),
      this.props.exceptionPauseModes.map(_createToggle),
    );
  },

  renderBreakpoint(breakpoint) {
    const snippet = truncateStr(breakpoint.text || "", 30);
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = breakpoint.condition !== null;

    return dom.div(
      {
        className: classnames({
          breakpoint,
          paused: isCurrentlyPaused,
          disabled: isDisabled,
          "is-conditional": isConditional
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
        handleClick: (ev) => this.removeBreakpoint(ev, breakpoint),
        tooltip: L10N.getStr("breakpoints.removeBreakpointTooltip")
      }));
  },

  render() {
    const { breakpoints } = this.props;
    return dom.div(
      { className: "pane breakpoints-list" },
      CommandBar(),
      this.renderGlobalBreakpoints(),
      (
        breakpoints.length > 0 ?
          breakpoints.valueSeq().map(this.renderBreakpoint) :
          dom.div({ className: "pane-info" }, L10N.getStr("breakpoints.none"))
      ),
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

/*
 * The pause on exception feature has three states in this order:
 *  1. don't pause on exceptions      [false, false]
 *  2. pause on uncaught exceptions   [true, true]
 *  3. pause on all exceptions        [true, false]
 */

function _getModes() {
  return [
    {
      mode: "no-pause",
      label: "Do not pause on exceptions.",
      headerLabel: "None",
      shouldPause: false,
      shouldIgnoreCaught: false,
    },
    {
      mode: "no-caught",
      label: "Pause on uncaught exceptions.",
      headerLabel: "Uncaught",
      shouldPause: true,
      shouldIgnoreCaught: true,
    },
    {
      mode: "with-caught",
      label: "Pause on all exceptions",
      headerLabel: "All",
      shouldPause: true,
      shouldIgnoreCaught: false,
    },
  ];
}

function _getPauseExceptionMode(state) {
  const shouldPause = getShouldPauseOnExceptions(state);
  const shouldIgnoreCaught = getShouldIgnoreCaughtExceptions(state);

  if (shouldPause) {
    if (shouldIgnoreCaught) {
      return _getModes().filter(item => item.mode === "no-caught")[0];
    }

    return _getModes().filter(item => item.mode === "with-caught")[0];
  }

  return _getModes().filter(item => item.mode === "no-pause")[0];
}

module.exports = connect(
  (state, props) => ({
    breakpoints: _getBreakpoints(state),
    exceptionPauseModes: _getModes(),
    currentExceptionPauseMode: _getPauseExceptionMode(state),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
