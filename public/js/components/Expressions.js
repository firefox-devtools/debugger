const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
// const classnames = require("classnames");
const Svg = require("./utils/Svg");
const actions = require("../actions");
const { getExpressions, getPause } = require("../selectors");
const Rep = React.createFactory(require("./Rep"));
// const { truncateStr } = require("../utils/utils");
const { DOM: dom, PropTypes } = React;

require("./Expressions.css");

const Expressions = React.createClass({
  propTypes: {
    expressions: ImPropTypes.list,
    addExpression: PropTypes.func,
    updateExpression: PropTypes.func,
    deleteExpression: PropTypes.func
  },

  displayName: "Expressions",

  addExpression(e) {
    const { addExpression } = this.props;
    if (e.key === "Enter") {
      const expression = {
        input: e.target.value
      };
      if (e.target.id) {
        expression.id = e.target.id.split("-").pop();
      }
      e.target.value = "";
      addExpression(expression);
    }
  },

  updateExpression(e) {
    const { updateExpression } = this.props;
    const id = e.target.id.split("-").pop();
    const expression = {
      id,
      input: e.target.textContent
    };
    updateExpression(expression);
    setTimeout(() => {
      document.getElementById("expressionInputId-" + id).focus();
    }, 1);
  },

  renderExpressionValue(value) {
    if (!value) {
      return;
    }
    if (value.exception) {
      return;
    }
    if (typeof value.result !== "object") {
      return value.result;
    }
    if (typeof value.result === "object") {
      return Rep({ object: value.result });
    }
  },

  deleteExpression(expression, e) {
    e.stopPropagation();
    const { deleteExpression } = this.props;
    deleteExpression(expression);
  },

  renderExpression(expression) {
    return dom.div(
      { className: "expression-container",
      key: expression.id },
      expression.updating ?
        dom.span(
          { className: "expression-input-container" },
          dom.input(
            { type: "text",
              className: "input-expression",
              id: "expressionInputId-" + expression.id,
              onKeyPress: this.addExpression,
              defaultValue: expression.input }
          )
        ) :
        dom.span(
          { className: "expression-output-container",
            key: expression.id,
            onClick: this.updateExpression },
          dom.span(
            { className: "expression-input",
              id: "expressionOutputId-" + expression.id },
            expression.input
          ),
          dom.span(
            { className: "expression-seperator" },
            ": "
          ),
          dom.span(
            { className: "expression-value" },
            this.renderExpressionValue(expression.value)
          ),
          dom.span(
            { className: "close-btn",
              id: "expressionDeleteId-" + expression.id,
              onClick: this.deleteExpression.bind(this, expression) },
            Svg("close")
          )
        )
    );
  },

  render() {
    const { expressions } = this.props;
    return dom.span(
      { className: "pane expressions-list" },
      dom.input(
        { type: "text",
          className: "input-expression",
          placeholder: "Add watch Expression",
          onKeyPress: this.addExpression }
      ),
      expressions.toSeq().map(expression => this.renderExpression(expression))
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
    expressions: getExpressions(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
