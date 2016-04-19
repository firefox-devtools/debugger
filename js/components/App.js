"use strict";

const React = require("react");
const { PropTypes } = React;
const { connect } = require("react-redux");

require("./App.css");
require("../lib/variables.css");
const Sources = React.createFactory(require("./Sources"));
const Editor = React.createFactory(require("./Editor"));
const SplitBox = React.createFactory(require("./SplitBox"));
const RightSidebar = React.createFactory(require("./RightSidebar"));
const { getSources, getBreakpoints, getSelectedSource } = require("../queries");

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    breakpoints: PropTypes.object
  },

  displayName: "App",

  render: function() {
    return SplitBox({
      initialWidth: 300,
      left: Sources({ sources: this.props.sources }),
      right: SplitBox({
        initialWidth: 300,
        rightFlex: true,
        left: Editor({ selectedSource: this.props.selectedSource }),
        right: RightSidebar()
      })
    });
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              breakpoints: getBreakpoints(state),
              selectedSource: getSelectedSource(state) })
)(App);
