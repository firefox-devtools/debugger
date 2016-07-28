const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
const classnames = require("classnames");
const actions = require("../actions");
const { getExpressions, getPause } = require("../selectors");
// const { truncateStr } = require("../utils/utils");
const { DOM: dom, PropTypes } = React;

require("./Expressions.css");

const Expressions = React.createClass({
  propTypes: {
    pauseInfo: ImPropTypes.map,
    expressions: ImPropTypes.list,
    addExpression: PropTypes.func,
    evaluateExpression: PropTypes.func,
    command: PropTypes.func
  },

  displayName: "Expressions",

  componentWillUpdate(nextProps, nextState) {
    const pauseInfo = nextProps.pauseInfo;
    const expressions = nextProps.expressions.toJS();
    if (pauseInfo) {
      for (let expression of expressions) {
        nextProps.evaluateExpression(expression);
      }
    }
  },

  addExpression(e) {
    if (e.key === "Enter") {
      const id = this.props.expressions.toSeq().size++;
      const expression = {
        id,
        expression: e.target.value
      };
      this.props.addExpression(expression);
    }
  },

  render() {
    const expressions = this.props.expressions.toJS();
    return dom.span(
      { className: "pane expressions-list" },
      dom.input(
        { type: "text",
          className: "input-expression",
          placeholder: "Add watch Expression",
          onKeyPress: this.addExpression }
      ),
      expressions.map(expression => {
        return dom.li(
          {key: expression.id},
          expression.expression+" --> " + JSON.stringify(expression.value)
        );
      })
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
    expressions: getExpressions(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
