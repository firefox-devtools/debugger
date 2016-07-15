const React = require("react");
const { DOM: dom, PropTypes } = React;
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const SourcesTree = React.createFactory(require("./SourcesTree"));
const actions = require("../actions");
const { getSelectedSource, getSources } = require("../selectors");

require("./Sources.css");

const Sources = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired
  },

  displayName: "Sources",

  render() {
    const { sources, selectSource } = this.props;

    return dom.div(
      { className: "sources-panel" },
      SourcesTree({ sources, selectSource })
    );
  }
});

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state),
              sources: getSources(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
