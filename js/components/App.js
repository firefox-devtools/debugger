const React = require("react");
const ReactDOM = require("react-dom");
const { connect } = require("react-redux");
const HSplitBox = React.createFactory(require("devtools/shared/components/h-split-box.js"));
const Sources = React.createFactory(require("./sources"));
const { getSources } = require("../queries");
const dom = React.DOM;

const App = React.createClass({
  getInitialState: function() {
    return { proportion: .5 };
  },

  handleResize: function(p) {
    this.setState({ proportion: p })
  },

  render: function() {
    const { proportion } = this.state;

    return dom.div(
      { style: { flex: 1 }},
      HSplitBox({
        start: Sources({ sources: this.props.sources }),
        end: "bar",
        startWidth: proportion,
        onResize: this.handleResize
      })
    )
  }
});

module.exports = connect(
  state => ({ sources: getSources(state) })
)(App);
