import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { getExpressions, getLoadedObjects, getPause } from "../../selectors";
const CloseButton = React.createFactory(require("../shared/Button/Close"));
const ObjectInspector = React.createFactory(require("../shared/ObjectInspector"));
const { DOM: dom, PropTypes } = React;

import "./Expressions.css";

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

const Expressions = React.createClass({
  propTypes: {
    expressions: ImPropTypes.list,
    addExpression: PropTypes.func,
    updateExpression: PropTypes.func,
    deleteExpression: PropTypes.func,
    loadObjectProperties: PropTypes.func,
    loadedObjects: ImPropTypes.map,
  },

  displayName: "Expressions",

  shouldComponentUpdate(nextProps, nextState) {
    const { expressions, loadedObjects } = this.props;
    return expressions !== nextProps.expressions
      || loadedObjects !== nextProps.loadedObjects;
  },

  inputKeyPress(e, { id }) {
    if (e.key !== "Enter") {
      return;
    }
    const { addExpression } = this.props;
    const expression = {
      input: e.target.value,
      id
    };

    e.target.value = "";
    addExpression(expression);
  },

  updateExpression(expression, { depth }) {
    if (depth > 0) {
      return;
    }

    this.props.updateExpression({
      id: expression.id,
      input: expression.input
    });
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

    if (expression.updating) {
      return this.renderExpressionUpdating(expression);
    }

    const { value, path } = getValue(expression);

    const root = {
      name: expression.input,
      path,
      contents: { value }
    };

    return dom.div(
      {
        className: "expression-container",
        key: path
      },
      ObjectInspector({
        roots: [root],
        getObjectProperties: id => loadedObjects.get(id),
        autoExpandDepth: 0,
        onLabelClick: (item, options) => this.updateExpression(
          expression, options
        ),
        loadObjectProperties
      }),
      CloseButton({ handleClick: e => this.deleteExpression(e, expression) }),
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
      expressions.toSeq().map(this.renderExpression),
      dom.input(
        { type: "text",
          className: "input-expression",
          placeholder: L10N.getStr("expressions.placeholder"),
          onKeyPress: e => this.inputKeyPress(e, {}) }
      )
    );
  }
});

export default connect(
  state => ({
    pauseInfo: getPause(state),
    expressions: getExpressions(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
