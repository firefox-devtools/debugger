const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak, getShouldPauseOnExceptions } = require("../selectors");
const { isEnabled } = require("../feature");
const Svg = require("./utils/Svg");
const ImPropTypes = require("react-immutable-proptypes");

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

function getItems() {
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
}

const RightSidebar = React.createClass({
  propTypes: {
    command: PropTypes.func,
    breakOnNext: PropTypes.func,
    pause: ImPropTypes.map,
    isWaitingOnBreak: PropTypes.bool,
    pauseOnExceptions: PropTypes.func,
    shouldPauseOnExceptions: PropTypes.bool,
    keyShortcuts: PropTypes.object,
  },

  displayName: "RightSidebar",

  resume() {
    if (this.props.pause) {
      this.props.command({ type: "resume" });
    } else if (!this.props.isWaitingOnBreak) {
      this.props.breakOnNext();
    }
  },

  stepOver() {
    if (!this.props.pause) {
      return;
    }
    this.props.command({ type: "stepOver" });
  },

  stepIn() {
    if (!this.props.pause) {
      return;
    }
    this.props.command({ type: "stepIn" });
  },

  stepOut() {
    if (!this.props.pause) {
      return;
    }
    this.props.command({ type: "stepOut" });
  },

  componentDidMount() {
    const { keyShortcuts } = this.props;
    keyShortcuts.on("F8", this.resume);
    keyShortcuts.on("F10", this.stepOver);
    keyShortcuts.on("F11", this.stepIn);
    keyShortcuts.on("F12", this.stepOut);
  },

  componentWillUnmount() {
    const { keyShortcuts } = this.props;
    keyShortcuts.off("F8", this.resume);
    keyShortcuts.off("F10", this.stepOver);
    keyShortcuts.off("F11", this.stepIn);
    keyShortcuts.off("F12", this.stepOut);
  },

  render() {
    const {
      command,
      breakOnNext,
      pause,
      isWaitingOnBreak,
      pauseOnExceptions,
      shouldPauseOnExceptions
    } = this.props;

    return (
      dom.div(
        { className: "right-sidebar",
          style: { overflowX: "hidden" }},
        dom.div(
          { className: "command-bar" },
          pause ? [
            debugBtn(() => command({ type: "resume" }), "resume",
              "active", "Click to resume (F8)"),
            debugBtn(() => command({ type: "stepOver" }), "stepOver",
              "active", "Step Over (F10)"),
            debugBtn(() => command({ type: "stepIn" }), "stepIn",
              "active", "Step In (F11)"),
            debugBtn(() => command({ type: "stepOut" }), "stepOut",
              "active", "Step Out \u21E7 (F12)"),
          ] : [
            isWaitingOnBreak ?
              debugBtn(null, "pause", "disabled", "Click to resume (F8)") :
              debugBtn(breakOnNext, "pause", "Click to resume (F8)"),
            debugBtn(null, "stepOver", "disabled", "Step Over (F10)"),
            debugBtn(null, "stepIn", "disabled", "Step In (F11)"),
            debugBtn(null, "stepOut", "disabled", "Step Out \u21E7 (F12)")
          ],

          debugBtn(() => command({ type: "disableBreakpoints" }),
            "disableBreakpoints", "disabled", "Disable Breakpoints"),
          debugBtn(() => pauseOnExceptions(!shouldPauseOnExceptions),
            "pause-exceptions",
            shouldPauseOnExceptions ? "enabled" : "disabled",
            "Toggle Pause on Exceptions"),
          debugBtn(() => command({ type: "subSettings" }), "subSettings",
            "", "Settings")
        ),

        Accordion({
          items: getItems()
        })
      )
    );
  }
});

module.exports = connect(
  state => ({
    pause: getPause(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state),
    shouldPauseOnExceptions: getShouldPauseOnExceptions(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(RightSidebar);
