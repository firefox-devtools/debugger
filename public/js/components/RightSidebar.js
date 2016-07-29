const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak, getShouldPauseOnExceptions } = require("../selectors");
const { isEnabled } = require("../feature");
const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Expressions = React.createFactory(require("./Expressions"));
const Scopes = React.createFactory(require("./Scopes"));
const Frames = React.createFactory(require("./Frames"));
const Accordion = React.createFactory(require("./Accordion"));
require("./RightSidebar.css");

function debugBtn(onClick, type, className = "active") {
  className = `${type} ${className}`;

  return dom.span(
    { onClick, className, key: type },
    dom.img({ src: `images/${type}.svg` })
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
  if (!isEnabled("features.watchExpressions")) {
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
          debugBtn(() => command({ type: "resume" }), "resume"),
          debugBtn(() => command({ type: "stepOver" }), "stepOver"),
          debugBtn(() => command({ type: "stepIn" }), "stepIn"),
          debugBtn(() => command({ type: "stepOut" }), "stepOut"),
        ] : [
          isWaitingOnBreak ?
            debugBtn(null, "pause", "disabled") :
            debugBtn(breakOnNext, "pause"),
          debugBtn(null, "stepOver", "disabled"),
          debugBtn(null, "stepIn", "disabled"),
          debugBtn(null, "stepOut", "disabled")
        ],

        debugBtn(() => command({ type: "disableBreakpoints" }),
                 "disableBreakpoints", "disabled"),
        debugBtn(() => pauseOnExceptions(!shouldPauseOnExceptions),
                 "pause-exceptions",
                 shouldPauseOnExceptions ? "enabled" : "disabled"),
        debugBtn(() => command({ type: "subSettings" }), "subSettings")
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
