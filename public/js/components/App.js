"use strict";

const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const actions = require("../actions");
const { bindActionCreators } = require("redux");

require("./App.css");
require("../lib/variables.css");
const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const SplitBox = createFactory(require("./SplitBox"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));
const { getSources, getBreakpoints } = require("../selectors");

function debugBtn(onClick, type, className = "active") {
  className = `${type} ${className}`;

  return dom.span(
    { onClick, className, key: type },
    dom.img({ src: `images/${type}.svg` })
  );
}

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    breakpoints: PropTypes.object
  },

  displayName: "App",

  render: function(command) {
    return dom.div({ className: "theme-light debugger" }, SplitBox({
      initialWidth: 300,
      left: Sources({ sources: this.props.sources }),
      right: SplitBox({
        initialWidth: 300,
        rightFlex: true,
        left: dom.div(
          { className: "editor-container" },
          SourceTabs(),
          Editor(),
          dom.div(
            {
              className: "source-footer"
            },
            dom.div({ className: "command-bar" },
              debugBtn(() => command({ type: "blackBox" }), "blackBox", "disabled"),
              debugBtn(() => command({ type: "prettyPrint" }), "prettyPrint", "disabled")
            )
          )
        ),
        right: RightSidebar()
      })
    }));
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              breakpoints: getBreakpoints(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
