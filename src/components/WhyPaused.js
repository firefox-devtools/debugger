const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getPause } = require("../selectors");
const { DOM: dom } = React;

require("./WhyPaused.css");

function getPauseReason(pauseInfo) {
  if (!pauseInfo) {
    return null;
  }

  let reasonType = pauseInfo.getIn(["why"]).get("type");
  if (!reasons[reasonType]) {
    console.log("reasonType", reasonType);
  }
  return reasons[reasonType];
}

const reasons = {
  "debuggerStatement": "Paused on a debugger; statement in the source code",
  "breakpoint": "Paused on a breakpoint"
};

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
