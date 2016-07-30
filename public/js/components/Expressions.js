const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
// const classnames = require("classnames");
const actions = require("../actions");
const { getExpressions, getPause } = require("../selectors");
// const ObjectInspector = React.createFactory(require("./ObjectInspector"));
// const { truncateStr } = require("../utils/utils");
const { DOM: dom, PropTypes } = React;

require("./Expressions.css");

const Expressions = React.createClass({
  propTypes: {
    pauseInfo: ImPropTypes.map,
    expressions: ImPropTypes.list,
    addExpression: PropTypes.func,
    updateExpression: PropTypes.func,
    evaluateExpression: PropTypes.func,
    loadObjectProperties: PropTypes.func,
    command: PropTypes.func
  },

  displayName: "Expressions",

  addExpression(e) {
    if (e.key === "Enter") {
      const expression = {
        input: e.target.value
      };
      if (e.target.id) {
        expression.id = e.target.id.split("-").pop();
      }
      this.props.addExpression(expression);
    }
  },

  updateExpression(e) {
    const expression = {
      id: parseInt(e.target.id.split("-").pop()),
      input: e.target.textContent.split(" --> ")[0]
    };
    this.props.updateExpression(expression);
  },

  renderExpression(expression) {
    return dom.div(
      { className: "expression-container",
        key: expression.id },
      expression.updating ?
        dom.input(
          { type: "text",
            className: "input-expression",
            id: "expressionInput-" + expression.id,
            placeholder: "Add watch Expression",
            onKeyPress: this.addExpression,
            defaultValue: expression.input }
        ) :
        dom.span(
          { key: expression.id,
            id: "expressionOutput-" + expression.id,
            onClick: this.updateExpression },
          expression.input + " --> " + JSON.stringify(expression.value || "Not Paused")
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
