const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const ImPropTypes = require("react-immutable-proptypes");
const actions = require("../actions");
const { getExpressions, getLoadedObjects, getPause } = require("../selectors");
const CloseButton = React.createFactory(require("./CloseButton"));
const ObjectInspector = React.createFactory(require("./ObjectInspector"));
const { DOM: dom, PropTypes } = React;

require("./Expressions.css");

function getValue(expression) {
  const value = expression.value;
  if (!value) {
    return {
      path: expression.from,
      value: "<not available>",
    };
  }

  if (value.exception) {
    return {
      path: expression.from,
      value: value.exception
    };
  }

  return {
    path: value.result.actor,
    value: value.result
  };
}

const Expressions = React.createClass({
  propTypes: {
    expressions: ImPropTypes.list,
    addExpression: PropTypes.func,
    updateExpression: PropTypes.func,
    deleteExpression: PropTypes.func,
    expressionInputVisibility: PropTypes.bool,
    loadObjectProperties: PropTypes.func,
    loadedObjects: ImPropTypes.map,
  },

  displayName: "Expressions",

  inputKeyPress(e, { id }) {
    if (e.key !== "Enter") {
      return;
    }
    const { addExpression } = this.props;
    const expression = {
      input: e.target.value
    };
    if (id !== undefined) {
      expression.id = id;
    }
    e.target.value = "";
    addExpression(expression);
  },

  updateExpression(e, { id }) {
    e.stopPropagation();
    const { updateExpression } = this.props;
    const expression = {
      id,
      input: e.target.textContent
    };
    updateExpression(expression);
  },

  deleteExpression(e, expression) {
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
          onKeyPress: e => this.inputKeyPress(e, expression),
          defaultValue: expression.input,
          ref: (c) => {
            this._input = c;
          }
        }
      )
    );
  },

  renderExpression(expression) {
    const { loadObjectProperties, loadedObjects } = this.props;

    const { value, path } = getValue(expression);

    const root = {
      name: expression.input,
      path,
      contents: { value }
    };

    return dom.span(
      {
        className: "expression-output-container",
        key: expression.id
      },
      ObjectInspector({
        roots: [root],
        getObjectProperties: id => loadedObjects.get(id),
        loadObjectProperties
      }),
      CloseButton({ handleClick: e => this.deleteExpression(e, expression) }),
    );
  },

  renderExpressionContainer(expression) {
    return dom.div(
      { className: "expression-container",
        key: expression.id + expression.input },
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
      this.props.expressionInputVisibility ?
      dom.input(
        { type: "text",
          className: "input-expression",
          placeholder: L10N.getStr("expressions.placeholder"),
          onKeyPress: e => this.inputKeyPress(e, {}) }
      ) : null,
      expressions.toSeq().map(expression =>
        this.renderExpressionContainer(expression))
    );
  }
});

module.exports = connect(
  state => ({ pauseInfo: getPause(state),
    expressions: getExpressions(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
