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
  getIsWaitingOnBreak,
  getBreakpointsDisabled,
  getBreakpointsLoading,
} = require("../selectors");
const { makeLocationId } = require("../reducers/breakpoints");
const { truncateStr } = require("../utils/utils");
const { PropTypes } = React;
const { endTruncateStr } = require("../utils/utils");
const { basename } = require("../utils/path");
const CloseButton = require("./shared/Button/Close");

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
    (
      <div className="location">
        {endTruncateStr(url, 30)}: {line}
      </div>
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
    pause: ImPropTypes.map,
    isWaitingOnBreak: PropTypes.bool,
    breakOnNext: PropTypes.func,
    breakpointsDisabled: PropTypes.bool,
    breakpointsLoading: PropTypes.bool,
    toggleAllBreakpoints: PropTypes.func,
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

  renderPauseExecutionButton() {
    const { breakOnNext, isWaitingOnBreak } = this.props;

    return (
      <button
        className="pause-execution"
        disabled={ isWaitingOnBreak }
        onClick={ breakOnNext }
      >
        { isWaitingOnBreak ?
          "Will pause on next execution" :
          "Pause on next execution" }
      </button>
    );
  },

  renderGlobalBreakpoints() {
    const { currentExceptionPauseMode } = this.props;
    const _createToggle = (fromMode) => {
      return (
        <label className="breakpoint" key={ fromMode.mode }>
          <input
            type="radio"
            onChange={ this.pauseExceptionModeToggled }
            value={ fromMode.mode }
            checked={ currentExceptionPauseMode.mode === fromMode.mode }
          />
          <div className="breakpoint-label">{ fromMode.label }</div>
        </label>
      );
    };

    return (
      <details>
        <summary className="_header">
          { `Exceptions - Pausing on: ${currentExceptionPauseMode.headerLabel}` }
          </summary>
        { this.props.exceptionPauseModes.map(_createToggle) }
      </details>
    );
  },

  renderUserBreakpointsHeader() {
    const { toggleAllBreakpoints, breakpointsDisabled,
      breakpoints, breakpointsLoading } = this.props;
    const label = breakpointsDisabled ? L10N.getStr("breakpoints.enable") :
      L10N.getStr("breakpoints.disable");
    const isIndeterminate = !breakpointsDisabled &&
      breakpoints.some(x => x.disabled);
    const clearAll = () => {
      if (confirm("Are you sure you want to remove all breakpoints?")) {
        breakpoints.forEach(
          breakpoint => this.props.removeBreakpoint(breakpoint.location)
        );
      }
    };

    return (
      <div className="user-breakpoints-header">
        <input
          type="checkbox"
          aria-label={ label }
          title={ label }
          disabled={ breakpointsLoading }
          onClick={ () => toggleAllBreakpoints(!breakpointsDisabled) }
          checked={ !breakpointsDisabled && !isIndeterminate }
          ref={ (input) => {
          if (input) {
            input.indeterminate = isIndeterminate;
          }
        } }
        />
        <button onClick={ clearAll }>
          Remove All
        </button>
      </div>
    );
  },

  renderUserBreakpoints() {
    const { breakpoints } = this.props;

    if (breakpoints.size === 0) {
      return (
        <div className="pane-info">
          { L10N.getStr("breakpoints.none") }
        </div>
      );
    }

    return (
      <div>
        { this.renderUserBreakpointsHeader() }
        { breakpoints.valueSeq().map(this.renderBreakpoint) }
      </div>
    );
  },

  renderBreakpoint(breakpoint) {
    const snippet = truncateStr(breakpoint.text || "", 30);
    const locationId = breakpoint.locationId;
    const line = breakpoint.location.line;
    const isCurrentlyPaused = breakpoint.isCurrentlyPaused;
    const isDisabled = breakpoint.disabled;
    const isConditional = breakpoint.condition !== null;

    return (
      <div
        className={ classnames({
        breakpoint,
          paused: isCurrentlyPaused,
          disabled: isDisabled,
          "is-conditional": isConditional
        }) }
        key={ locationId }
        onClick={ () => this.selectBreakpoint(breakpoint) }
      >
        <input
          type="checkbox"
          className="breakpoint-checkbox"
          checked={ !isDisabled }
          onChange={ () => this.handleCheckbox(breakpoint) }
          onClick={ (ev) => ev.stopPropagation() }
        />
        <div
          className="breakpoint-label"
          title={ breakpoint.text }
        >
          <div>
            { renderSourceLocation(breakpoint.location.source, line) }
          </div>
        </div>
        <div
          className="breakpoint-snippet"
        >
          { snippet }
        </div>
        { CloseButton({
          handleClick: (ev) => this.removeBreakpoint(ev, breakpoint),
          tooltip: L10N.getStr("breakpoints.removeBreakpointTooltip")
        }) }
      </div>
    );
  },

  render() {
    return (
      <div className="pane breakpoints-list">
        { this.renderPauseExecutionButton() }
        { this.renderGlobalBreakpoints() }
        { this.renderUserBreakpoints() }
      </div>
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
    pause: getPause(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Breakpoints);
