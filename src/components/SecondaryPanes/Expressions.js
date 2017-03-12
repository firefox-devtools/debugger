// @flow
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
    expressions: ImPropTypes.list.isRequired,
    addExpression: PropTypes.func.isRequired,
    updateExpression: PropTypes.func.isRequired,
    deleteExpression: PropTypes.func.isRequired,
    loadObjectProperties: PropTypes.func,
    loadedObjects: ImPropTypes.map.isRequired
  },

  _input: (null: any),

  displayName: "Expressions",

  getInitialState() {
    return {
      editing: null
    };
  },

  shouldComponentUpdate(nextProps, nextState) {
    const { editing } = this.state;
    const { expressions, loadedObjects } = this.props;
    return expressions !== nextProps.expressions
      || loadedObjects !== nextProps.loadedObjects
      || editing !== nextState.editing;
  },

  editExpression(expression, { depth }) {
    if (depth > 0) {
      return;
    }

    this.setState({ editing: expression.input });
  },

  deleteExpression(e, expression) {
    e.stopPropagation();
    const { deleteExpression } = this.props;
    deleteExpression(expression);
  },

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
    this.props.updateExpression(
      value,
      expression
    );
  },

  renderExpressionEditInput(expression) {
    return dom.span(
      { className: "expression-input-container" },
      dom.input(
        { type: "text",
          className: "input-expression",
          onKeyPress: e => this.inputKeyPress(e, expression),
          onBlur: () => {
            this.setState({ editing: null });
          },
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
    const { editing } = this.state;
    const { input } = expression;
    if (editing == input) {
      return this.renderExpressionEditInput(expression);
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
        key: path || input
      },
      ObjectInspector({
        roots: [root],
        getObjectProperties: id => loadedObjects.get(id),
        autoExpandDepth: 0,
        onDoubleClick: (item, options) => this.editExpression(
          expression, options
        ),
        loadObjectProperties,
        getActors: () => ({})
      }),
      CloseButton({ handleClick: e => this.deleteExpression(e, expression) }),
    );
  },

  componentDidUpdate() {
    if (this._input) {
      this._input.focus();
    }
  },

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
         onBlur: e => (e.target.value = ""),
         onKeyPress
       })
    );
  },

  render() {
    const { expressions } = this.props;
    return dom.span(
      { className: "pane expressions-list" },
      expressions.map(this.renderExpression),
      this.renderNewExpressionInput()
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
