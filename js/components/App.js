"use strict";

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { connect } = require("react-redux");

require("./App.css");
require("../lib/variables.css");
const Sources = React.createFactory(require("./Sources"));
const Editor = React.createFactory(require("./Editor"));
const Breakpoints = React.createFactory(require("./Breakpoints"));
const Accordion = React.createFactory(require("./Accordion"));
const SplitBox = React.createFactory(require("./SplitBox"));
const { getSources, getBreakpoints, getSelectedSource } = require("../queries");

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    breakpoints: PropTypes.object
  },

  displayName: "App",

  render: function() {
    return dom.div(
      { style: { flex: 1,
                 overflow: "hidden" }},
      SplitBox({
        initialWidth: 300,
        left: Sources({ sources: this.props.sources }),
        right: SplitBox({
          initialWidth: 300,
          rightFlex: true,
          left: Editor({ selectedSource: this.props.selectedSource }),
          right: Accordion({
            items: [
              { header: "Breakpoints",
                component: Breakpoints,
                opened: true },
              { header: "Foo",
                component: () => dom.div(null, "hi")
              }
            ]
          })
        })
      })

    );
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              breakpoints: getBreakpoints(state),
              selectedSource: getSelectedSource(state) })
)(App);
