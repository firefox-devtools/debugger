const React = require("react");
const ReactDOM = require("react-dom");
const { connect } = require("react-redux");

require("./app.css");
const Sources = React.createFactory(require("./sources"));
const Editor  = React.createFactory(require("./editor"));
const Breakpoints = React.createFactory(require("./breakpoints"));
const SplitBox = React.createFactory(require("./SplitBox"));
const { getSources, getBreakpoints, getSelectedSource } = require("../queries");
const dom = React.DOM;

const App = React.createClass({
  render: function() {
    return dom.div(
      { style: { flex: 1,
                 overflow: 'hidden' }},
      SplitBox({
        initialWidth: 100,
        left: Sources({ sources: this.props.sources }),
        right: SplitBox({
          initialWidth: 100,
          rightFlex: true,
          left: Editor({ selectedSource: this.props.selectedSource }),
          right: Breakpoints({ breakpoints: this.props.breakpoints })
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
