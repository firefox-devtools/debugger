const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak, getBreakpointsDisabled,
        getShouldPauseOnExceptions, getShouldIgnoreCaughtExceptions,
        getBreakpoints, getBreakpointsLoading
      } = require("../selectors");
const { isEnabled } = require("../feature");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");

const { Services } = require("Services");
const shiftKey = Services.appinfo.OS === "Darwin" ? "\u21E7" : "Shift+";
const ctrlKey = Services.appinfo.OS === "Linux" ? "Ctrl+" : "";

const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Expressions = React.createFactory(require("./Expressions"));
const Scopes = React.createFactory(require("./Scopes"));
const Frames = React.createFactory(require("./Frames"));
const Accordion = React.createFactory(require("./Accordion"));
require("./RightSidebar.css");

function debugBtn(onClick, type, className, tooltip) {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

const RightSidebar = React.createClass({
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
    keyShortcuts: PropTypes.object
  },

  displayName: "RightSidebar",

  resume() {
    if (this.props.pause) {
      this.props.resume();
    } else if (!this.props.isWaitingOnBreak) {
      this.props.breakOnNext();
    }
  },

  stepOver() {
    if (!this.props.pause) {
      return;
    }
    this.props.stepOver();
  },

  stepIn() {
    if (!this.props.pause) {
      return;
    }
    this.props.stepIn();
  },

  stepOut() {
    if (!this.props.pause) {
      return;
    }
    this.props.stepOut();
  },

  setupKeyboardShortcuts() {
    const { keyShortcuts } = this.props;
    if (this.keyShortcutsEnabled) {
      return;
    }

    this.keyShortcutsEnabled = true;
    keyShortcuts.on("F8", this.resume);
    keyShortcuts.on("F10", this.stepOver);
    keyShortcuts.on(`${ctrlKey}F11`, this.stepIn);
    keyShortcuts.on(`${ctrlKey}Shift+F11`, this.stepOut);
  },

  componentWillUnmount() {
    const { keyShortcuts } = this.props;
    keyShortcuts.off("F8", this.resume);
    keyShortcuts.off("F10", this.stepOver);
    keyShortcuts.off(`${ctrlKey}F11`, this.stepIn);
    keyShortcuts.off(`${ctrlKey}Shift+F11`, this.stepOut);
  },

  componentDidUpdate() {
    this.setupKeyboardShortcuts();
  },

  renderStepButtons() {
    const className = this.props.pause ? "active" : "disabled";
    return [
      debugBtn(this.stepOver, "stepOver", className, "Step Over (F10)"),
      debugBtn(this.stepIn, "stepIn", className, `Step In (${ctrlKey}F11)`),
      debugBtn(this.stepOut, "stepOut", className,
        `Step Out (${ctrlKey}${shiftKey}F11)`),
    ];
  },

  renderPauseButton() {
    const { pause, breakOnNext, isWaitingOnBreak } = this.props;

    if (pause) {
      return debugBtn(this.resume, "resume", "active", "Click to resume (F8)");
    }

    if (isWaitingOnBreak) {
      return debugBtn(null, "pause", "disabled", "Waiting for next execution");
    }

    return debugBtn(breakOnNext, "pause", "active", "Click to pause (F8)");
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

    function pauseBtn(pause, ignore, tooltip) {
      return debugBtn(
        () => pauseOnExceptions(pause, ignore),
        "pause-exceptions",
        "enabled",
        tooltip
      );
    }

    if (!shouldPauseOnExceptions && !shouldIgnoreCaughtExceptions) {
      return pauseBtn(true, true, "Ignore exceptions");
    }

    if (shouldPauseOnExceptions && shouldIgnoreCaughtExceptions) {
      return pauseBtn(true, false, "Pause on uncaught exceptions");
    }

    return pauseBtn(false, false, "Pause on all exceptions");
  },

  renderDisableBreakpoints() {
    const { toggleAllBreakpoints, breakpoints,
            breakpointsDisabled, breakpointsLoading } = this.props;

    if (breakpoints.size == 0 || breakpointsLoading) {
      return debugBtn(
        null, "disableBreakpoints", "disabled", "Disable Breakpoints"
      );
    }

    return debugBtn(
      () => toggleAllBreakpoints(!breakpointsDisabled),
      "disableBreakpoints",
      breakpointsDisabled ? "breakpoints-disabled" : "",
      "Disable Breakpoints"
    );
  },

  getItems() {
    const items = [
    { header: "Breakpoints",
      component: Breakpoints,
      opened: true },
    { header: "Call Stack",
      component: Frames },
    { header: "Scopes",
      component: Scopes }
    ];
    if (isEnabled("watchExpressions")) {
      items.unshift({ header: "Watch Expressions",
        component: Expressions,
        opened: true });
    }
    return items;
  },

  render() {
    return (
      dom.div(
        { className: "right-sidebar",
          style: { overflowX: "hidden" }},
        dom.div(
          { className: "command-bar" },
          this.renderPauseButton(),
          this.renderStepButtons(),
          this.renderDisableBreakpoints(),
          this.renderPauseOnExceptions()
        ),

        Accordion({
          items: this.getItems()
        })
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
    };},
  dispatch => bindActionCreators(actions, dispatch)
)(RightSidebar);
