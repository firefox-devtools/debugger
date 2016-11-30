const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getPause } = require("../selectors");
const { DOM: dom } = React;

const { getPauseReason } = require("../utils/pause");

require("./WhyPaused.css");

const WhyPaused = React.createClass({
  propTypes: {
    pauseInfo: ImPropTypes.map
  },

  displayName: "WhyPaused",

  render() {
    const { pauseInfo } = this.props;
    const reason = getPauseReason(pauseInfo);

    return reason ?
      dom.div({ className: "pane why-paused" }, reason)
      : null;
  }
});

module.exports = connect(
  state => ({
    pauseInfo: getPause(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WhyPaused);
