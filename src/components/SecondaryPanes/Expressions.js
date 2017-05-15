// @flow
import { DOM as dom, createFactory, PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import {
  getVisibleExpressions,
  getLoadedObjects,
  getPause
} from "../../selectors";

import _CloseButton from "../shared/Button/Close";
const CloseButton = createFactory(_CloseButton);

import _ObjectInspector from "../shared/ObjectInspector";
const ObjectInspector = createFactory(_ObjectInspector);

import "./Expressions.css";

import type { List } from "immutable";
import type { Expression } from "../../types";

function getValue(expression) {
  const value = expression.value;
  if (!value) {
    return {
      path: expression.from,
      value: "<not available>"
    };
  }

  if (value.exception) {
    return {
      path: value.from,
      value: value.exception
    };
  }

  if (typeof value.result == "object") {
    return {
      path: value.result.actor,
      value: value.result
    };
  }

  return {
    path: value.input,
    value: value.result
  };
}

class Expressions extends PureComponent {
  _input: null | any;

  state: {
    editing: null | Node
  };

  renderExpression: Function;

  props: {
    expressions: List<Expression>,
    addExpression: (string, ?Object) => any,
    evaluateExpressions: () => any,
    updateExpression: (string, Expression) => any,
    deleteExpression: Expression => any,
    loadObjectProperties: () => any,
    loadedObjects: Map<string, any>
  };

  constructor(...args) {
    super(...args);

    this.state = {
      editing: null
    };

    this.renderExpression = this.renderExpression.bind(this);
  }

  componentDidMount() {
    const { expressions, evaluateExpressions } = this.props;
    if (expressions.size > 0) {
      evaluateExpressions();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { editing } = this.state;
    const { expressions, loadedObjects } = this.props;
    return (
      expressions !== nextProps.expressions ||
      loadedObjects !== nextProps.loadedObjects ||
      editing !== nextState.editing
    );
  }

  editExpression(expression, { depth }) {
    if (depth > 0) {
      return;
    }

    this.setState({ editing: expression.input });
  }

  deleteExpression(e, expression) {
    e.stopPropagation();
    const { deleteExpression } = this.props;
    deleteExpression(expression);
  }

  inputKeyPress(e, expression) {
    if (e.key !== "Enter") {
      return;
    }

    const value = e.target.value;
    if (value == "") {
      return;
    }

    this.setState({ editing: null });
    e.target.value = "";
    this.props.updateExpression(value, expression);
  }

  renderExpressionEditInput(expression) {
    return dom.span(
      { className: "expression-input-container" },
      dom.input({
        type: "text",
        className: "input-expression",
        onKeyPress: e => this.inputKeyPress(e, expression),
        onBlur: () => {
          this.setState({ editing: null });
        },
        defaultValue: expression.input,
        ref: c => {
          this._input = c;
        }
      })
    );
  }

  renderExpression(expression) {
    const { loadObjectProperties, loadedObjects } = this.props;
    const { editing } = this.state;
    const { input, updating } = expression;

    if (editing == input) {
      return this.renderExpressionEditInput(expression);
    }

    if (updating) {
      return;
    }

    let { value, path } = getValue(expression);

    if (value.class == "Error") {
      value = { unavailable: true };
    }

    const root = {
      name: expression.input,
      path,
      contents: { value }
    };

    return dom.div(
      {
        className: "expression-container",
        key: path || input
      },
      ObjectInspector({
        roots: [root],
        getObjectProperties: id => loadedObjects[id],
        autoExpandDepth: 0,
        onDoubleClick: (item, options) =>
          this.editExpression(expression, options),
        loadObjectProperties
      }),
      CloseButton({ handleClick: e => this.deleteExpression(e, expression) })
    );
  }

  componentDidUpdate() {
    if (this._input) {
      this._input.focus();
    }
  }

  renderNewExpressionInput() {
    const onKeyPress = e => {
      if (e.key !== "Enter") {
        return;
      }

      const value = e.target.value;
      if (value == "") {
        return;
      }

      e.stopPropagation();
      e.target.value = "";
      this.props.addExpression(value);
    };
    return dom.span(
      { className: "expression-input-container" },
      dom.input({
        type: "text",
        className: "input-expression",
        placeholder: L10N.getStr("expressions.placeholder"),
        onBlur: e => {
          e.target.value = "";
        },
        onKeyPress
      })
    );
  }

  render() {
    const { expressions } = this.props;
    return dom.span(
      { className: "pane expressions-list" },
      expressions.map(this.renderExpression),
      this.renderNewExpressionInput()
    );
  }
}

Expressions.propTypes = {
  expressions: ImPropTypes.list.isRequired,
  addExpression: PropTypes.func.isRequired,
  evaluateExpressions: PropTypes.func.isRequired,
  updateExpression: PropTypes.func.isRequired,
  deleteExpression: PropTypes.func.isRequired,
  loadObjectProperties: PropTypes.func,
  loadedObjects: PropTypes.object.isRequired
};

Expressions.displayName = "Expressions";

export default connect(
  state => ({
    pauseInfo: getPause(state),
    expressions: getVisibleExpressions(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
