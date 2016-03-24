const React = require("react");
const ReactDOM = require("react-dom");
const { connect } = require("react-redux");
const HSplitBox = React.createFactory(require("devtools/shared/components/h-split-box.js"));
const Sources = React.createFactory(require("./sources"));
const Editor  = React.createFactory(require("./editor"));
const Breakpoints = React.createFactory(require("./breakpoints"));
const { getSources, getBreakpoints, getSelectedSource } = require("../queries");
const dom = React.DOM;

const Box = React.createFactory(React.createClass({
  getInitialState: function() {
    return { proportion: .25 };
  },

  handleResize: function(p) {
    this.setState({ proportion: p })
  },

  render: function() {
    return HSplitBox({
	  start: this.props.start,
	  end: this.props.end,
	  startWidth: this.state.proportion,
      onResize: this.handleResize
	})
  }
}));

const App = React.createClass({
  render: function() {
    return dom.div(
      { style: { flex: 1 }},
      Box({
        start: Sources({ sources: this.props.sources }),
        end: Box({
          start: Editor({ selectedSource: this.props.selectedSource }),
          end: Breakpoints({ breakpoints: this.props.breakpoints })
        })
      })
    )
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              breakpoints: getBreakpoints(state),
	          selectedSource: getSelectedSource(state) })
)(App);
