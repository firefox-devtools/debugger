"use strict";

const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause, getIsWaitingOnBreak } = require("../selectors");
const Isvg = React.createFactory(require("react-inlinesvg"));

const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Scopes = React.createFactory(require("./Scopes"));
const Accordion = React.createFactory(require("./Accordion"));
require("./RightSidebar.css");

function debugBtn(onClick, type, className) {
  return dom.span(
    { onClick, className, key: type },
    Isvg({ src: `images/${type}.svg`})
  );
}

function RightSidebar({ resume, command, breakOnNext,
                        pause, isWaitingOnBreak }) {
  return (
    dom.div({className: "right-sidebar"},
      dom.div({className: "command-bar"},
        (
          pause
            ? [
              debugBtn(() => command({ type: "resume" }), "resume"),
              debugBtn(() => command({ type: "stepOver" }), "stepOver"),
              debugBtn(() => command({ type: "stepIn" }), "stepIn"),
              debugBtn(() => command({ type: "stepOut" }), "stepOut")
            ]
            : [
              isWaitingOnBreak
                ? debugBtn(null, "pause", "disabled")
                : debugBtn(breakOnNext, "pause"),
              debugBtn(null, "stepOver", "disabled"),
              debugBtn(null, "stepIn", "disabled"),
              debugBtn(null, "stepOut", "disabled")
            ]
        )
      ),
      Accordion({
        items: [
          { header: "Breakpoints",
            component: Breakpoints,
            opened: true },
          { header: "Call Stack",
            component: () => dom.div({className: "pane-info"}, "Not Paused")
          },
          { header: "Scopes",
            component: Scopes
          }
        ]
      })
    )
  );
}

module.exports = connect(
  state => ({
    pause: getPause(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(RightSidebar);
