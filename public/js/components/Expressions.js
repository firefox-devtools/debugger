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

  addExpression({ id }, e) {
    if (e.key === "Enter") {
      const { addExpression } = this.props;
      const expression = {
        input: e.target.value
      };
      if (id !== undefined) {
        expression.id = id;
      }
      e.target.value = "";
      addExpression(expression);
    }
  },

  updateExpression({ id }, e) {
    e.stopPropagation();
    const { updateExpression } = this.props;
    const expression = {
      id,
      input: e.target.textContent
    };
    updateExpression(expression);
  },

  renderExpressionValue(value) {
    if (!value) {
      return;
    }
    if (value.exception) {
      return Rep({ object: value.exception });
    }
    if (typeof value.result === "boolean") {
      return `${value.result}`;
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

  renderExpressionUpdating(expression) {
    return dom.span(
      { className: "expression-input-container" },
      dom.input(
        { type: "text",
          className: "input-expression",
          dataId: expression.id,
          id: "expressionInputId-" + expression.id,
          onKeyPress: this.addExpression.bind(this, expression),
          defaultValue: expression.input,
          ref: (c) => {
            this._input = c;
          }
        }
      )
    );
  },

  renderExpression(expression) {
    return dom.span(
      { className: "expression-output-container",
        key: expression.id },
      dom.span(
        { className: "expression-input",
          dataId: expression.id,
          id: "expressionOutputId-" + expression.id,
          onClick: this.updateExpression.bind(this, expression) },
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
          onClick: this.deleteExpression.bind(this, expression) },
        Svg("close")
      )
    );
  },

  renderExpressionContainer(expression) {
    return dom.div(
      { className: "expression-container",
      key: expression.id },
      expression.updating ?
        this.renderExpressionUpdating(expression) :
        this.renderExpression(expression)
    );
  },

  componentDidUpdate() {
    if (this._input) {
      this._input.focus();
    }
  },

  render() {
    const { expressions } = this.props;
    return dom.span(
      { className: "pane expressions-list" },
      dom.input(
        { type: "text",
          className: "input-expression",
          placeholder: "Add watch Expression",
          onKeyPress: this.addExpression.bind(this, {}) }
      ),
      expressions.toSeq().map(expression =>
        this.renderExpressionContainer(expression))
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
    expressions: getExpressions(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
