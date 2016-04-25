"use strict";

const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause } = require("../queries");
const Isvg = React.createFactory(require("react-inlinesvg"));

const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Accordion = React.createFactory(require("./Accordion"));
require("./RightSidebar.css");

function debugBtn(onClick, type) {
  return dom.span(
    { onClick },
    Isvg({ src: `images/${type}.svg`})
  );
}

function RightSidebar({ resume, command, breakOnNext, pause }) {
  return (
    dom.div({className: "right-sidebar"},
      dom.div({className: "command-bar"},
        (
          pause
            ? debugBtn(() => command({ type: "resume" }), "resume")
            : debugBtn(breakOnNext, "pause")
        ),
        debugBtn(() => command({ type: "stepOver" }), "stepOver"),
        debugBtn(() => command({ type: "stepIn" }), "stepIn"),
        debugBtn(() => command({ type: "stepOut" }), "stepOut")
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
            component: () => dom.div({className: "pane-info"}, "Not Paused")
          }
        ]
      })
    )
  );
}

module.exports = connect(
  state => ({ pause: getPause(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(RightSidebar);
