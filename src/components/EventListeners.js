const React = require("react");
const { DOM: dom, PropTypes } = React;
const { div } = dom;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getEventListeners } = require("../selectors");

require("./EventListeners.css");

function renderListener({ type, selector, line, sourceId }, selectSource) {
  return dom.div({
    className: "listener",
    onClick: () => selectSource(sourceId, { line }),
    key: `${type}`
  },
    dom.span({ className: "type" }, type),
    dom.span({ className: "selector" }, selector),
  );
}

function EventListeners({ selectSource, listeners }) {
  return dom.div({
    className: "pane event-listeners"
  },
    listeners.map((l) => renderListener(l, selectSource))
  );
}

EventListeners.propTypes = {
  listeners: PropTypes.array
};

module.exports = connect(
  state => ({ listeners: getEventListeners(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(EventListeners);
