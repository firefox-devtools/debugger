"use strict";

const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { getPause } = require("../queries");

const actions = require("../actions");
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Accordion = React.createFactory(require("./Accordion"));
require("./RightSidebar.css");

function RightSidebar({ resume, command, breakOnNext, pause }) {
  return (
    dom.div({className: "right-sidebar"},
      dom.div({className: "command-bar"},
        (
          pause
            ? dom.button({ onClick: () => command({type: "resume"}) }, "Resume")
            : dom.button({ onClick: breakOnNext }, "Pause")
        ),
        dom.button({ onClick: () => command({type: "stepOver"}) }, "Over"),
        dom.button({ onClick: () => command({type: "stepIn"}) }, "In"),
        dom.button({ onClick: () => command({type: "stepOut"}) }, "Out")
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
