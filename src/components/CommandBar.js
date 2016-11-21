const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak, getBreakpointsDisabled,
        getShouldPauseOnExceptions, getShouldIgnoreCaughtExceptions,
        getBreakpoints, getBreakpointsLoading
      } = require("../selectors");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");

const { Services: { appinfo }} = require("devtools-modules");

const shiftKey = appinfo.OS === "Darwin" ? "\u21E7" : "Shift+";
const ctrlKey = appinfo.OS === "Linux" ? "Ctrl+" : "";

const actions = require("../actions");
require("./CommandBar.css");

function debugBtn(onClick, type, className, tooltip) {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

const CommandBar = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    resume: PropTypes.func,
    stepIn: PropTypes.func,
    stepOut: PropTypes.func,
    stepOver: PropTypes.func,
    toggleAllBreakpoints: PropTypes.func,
    breakOnNext: PropTypes.func,
    pause: ImPropTypes.map,
    pauseOnExceptions: PropTypes.func,
    shouldPauseOnExceptions: PropTypes.bool,
    shouldIgnoreCaughtExceptions: PropTypes.bool,
    breakpoints: ImPropTypes.map,
    isWaitingOnBreak: PropTypes.bool,
    breakpointsDisabled: PropTypes.bool,
    breakpointsLoading: PropTypes.bool,
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  displayName: "CommandBar",

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("F8", this.props.resume);
    shortcuts.off("F10", this.props.stepOver);
    shortcuts.off(`${ctrlKey}F11`, this.props.stepIn);
    shortcuts.off(`${ctrlKey}Shift+F11`, this.props.stepOut);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("F8", this.props.resume);
    shortcuts.on("F10", this.props.stepOver);
    shortcuts.on(`${ctrlKey}F11`, this.props.stepIn);
    shortcuts.on(`${ctrlKey}Shift+F11`, this.props.stepOut);
  },

  renderStepButtons() {
    const className = this.props.pause ? "active" : "disabled";
    return [
      debugBtn(this.props.stepOver, "stepOver", className,
        L10N.getStr("stepOverTooltip")
      ),
      debugBtn(this.props.stepIn, "stepIn", className,
        L10N.getFormatStr("stepInTooltip", ctrlKey)
      ),
      debugBtn(this.props.stepOut, "stepOut", className,
        L10N.getFormatStr("stepOutTooltip", ctrlKey + shiftKey)
      )
    ];
  },

  renderPauseButton() {
    const { pause, breakOnNext, isWaitingOnBreak } = this.props;

    if (pause) {
      return debugBtn(this.props.resume, "resume", "active",
        L10N.getStr("resumeButtonTooltip")
      );
    }

    if (isWaitingOnBreak) {
      return debugBtn(null, "pause", "disabled",
        L10N.getStr("pausePendingButtonTooltip")
      );
    }

    return debugBtn(breakOnNext, "pause", "active",
      L10N.getStr("pauseButtonTooltip")
    );
  },

  /*
   * The pause on exception button has three states in this order:
   *  1. don't pause on exceptions      [false, false]
   *  2. pause on uncaught exceptions   [true, true]
   *  3. pause on all exceptions        [true, false]
  */
  renderPauseOnExceptions() {
    const { shouldPauseOnExceptions, shouldIgnoreCaughtExceptions,
            pauseOnExceptions } = this.props;

    if (!shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions) {
      return debugBtn(
        () => pauseOnExceptions(true, true),
        "pause-exceptions",
        "enabled",
        L10N.getStr("ignoreExceptions")
      );
    }

    if (shouldPauseOnExceptions && shouldIgnoreCaughtExceptions) {
      return debugBtn(
        () => pauseOnExceptions(true, false),
        "pause-exceptions",
        "uncaught enabled",
        L10N.getStr("pauseOnUncaughtExceptions")
      );
    }

    return debugBtn(
      () => pauseOnExceptions(false, false),
      "pause-exceptions",
      "all enabled",
      L10N.getStr("pauseOnExceptions")
    );
  },

  renderDisableBreakpoints() {
    const { toggleAllBreakpoints, breakpoints,
            breakpointsDisabled, breakpointsLoading } = this.props;

    if (breakpoints.size == 0 || breakpointsLoading) {
      return debugBtn(
        null, "toggleBreakpoints", "disabled", "Disable Breakpoints"
      );
    }

    return debugBtn(
      () => toggleAllBreakpoints(!breakpointsDisabled),
      "toggleBreakpoints",
      breakpointsDisabled ? "breakpoints-disabled" : "",
      "Disable Breakpoints"
    );
  },

  render() {
    return (
      dom.div(
        { className: "command-bar" },
        this.renderPauseButton(),
        this.renderStepButtons(),
        this.renderDisableBreakpoints(),
        this.renderPauseOnExceptions()
      )
    );
  }
});

module.exports = connect(
  state => {
    return {
      pause: getPause(state),
      isWaitingOnBreak: getIsWaitingOnBreak(state),
      shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
      shouldIgnoreCaughtExceptions: getShouldIgnoreCaughtExceptions(state),
      breakpointsDisabled: getBreakpointsDisabled(state),
      breakpoints: getBreakpoints(state),
      breakpointsLoading: getBreakpointsLoading(state),
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(CommandBar);
