const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak, getShouldPauseOnExceptions } = require("../selectors");
const { isEnabled } = require("../feature");
const Svg = require("./utils/Svg");

const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Expressions = React.createFactory(require("./Expressions"));
const Scopes = React.createFactory(require("./Scopes"));
const Frames = React.createFactory(require("./Frames"));
const Accordion = React.createFactory(require("./Accordion"));
require("./RightSidebar.css");

function debugBtn(onClick, type, className = "active", tooltip) {
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
  if (isEnabled("features.watchExpressions")) {
    items.unshift({ header: "Watch Expressions",
      component: Expressions,
      opened: true });
  }
  return items;
}

function RightSidebar({ resume, command, breakOnNext,
                        pause, isWaitingOnBreak,
                        pauseOnExceptions, shouldPauseOnExceptions }) {
  return (
    dom.div(
      { className: "right-sidebar",
        style: { overflowX: "hidden" }},
      dom.div(
        { className: "command-bar" },
        pause ? [
          debugBtn(() => command({ type: "resume" }), "resume",
            null, "Click to resume (F8)"),
          debugBtn(() => command({ type: "stepOver" }), "stepOver",
            null, "Step Over (F10)"),
          debugBtn(() => command({ type: "stepIn" }), "stepIn",
            null, "Step In (F11)"),
          debugBtn(() => command({ type: "stepOut" }), "stepOut",
            null, "Step Out \u21E7 (F12)"),
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
          null, "Settings")
      ),

      Accordion({
        items: getItems()
      })
    )
  );
}

module.exports = connect(
  state => ({
    pause: getPause(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state),
    shouldPauseOnExceptions: getShouldPauseOnExceptions(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(RightSidebar);
