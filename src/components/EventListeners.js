/*
Brandon W Maister
quodlibetor@{gmail,github}

*/

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { div } = dom;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getEventListeners } = require("../selectors");

function renderListener({ sourceId, line, type, selector }, selectSource) {
  return dom.div({
    key: `type:${type},sourceId:${sourceId},line:${line}`,
    onClick: () => selectSource(sourceId, { line })
  },
    `${type}.${selector}`
  );
}

function EventListeners({ selectSource, listeners }) {
  return dom.div({}, listeners.map((l) => renderListener(l, selectSource)));
}

EventListeners.propTypes = {
  listeners: PropTypes.array
};

module.exports = connect(
  state => ({ listeners: getEventListeners(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(EventListeners);
