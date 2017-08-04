// @flow
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import {
  getVisibleExpressions,
  getLoadedObjects,
  getPause
} from "../../selectors";

import CloseButton from "../shared/Button/Close";
import { ObjectInspector } from "devtools-reps";

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

  if (value.error) {
    return {
      path: value.from,
      value: value.error
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
    addExpression: (string, ?Object) => void,
    evaluateExpressions: () => void,
    updateExpression: (string, Expression) => void,
    deleteExpression: Expression => void,
    loadObjectProperties: () => void,
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
    return (
      <span className="expression-input-container" key={expression.input}>
        <input
          className="input-expression"
          type="text"
          onKeyPress={e => this.inputKeyPress(e, expression)}
          onBlur={() => this.setState({ editing: null })}
          defaultValue={expression.input}
          ref={c => (this._input = c)}
        />
      </span>
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

    return (
      <li className="expression-container" key={`${path}/${input}`}>
        <div className="expression-content">
          <ObjectInspector
            roots={[root]}
            autoExpandDepth={0}
            disableWrap={true}
            disabledFocus={true}
            onDoubleClick={(items, options) =>
              this.editExpression(expression, options)}
            getObjectProperties={id => loadedObjects[id]}
            loadObjectProperties={loadObjectProperties}
            // TODO: See https://github.com/devtools-html/debugger.html/issues/3555.
            getObjectEntries={actor => {}}
            loadObjectEntries={grip => {}}
          />
          <div className="expression-container__close-btn">
            <CloseButton
              handleClick={e => this.deleteExpression(e, expression)}
            />
          </div>
        </div>
      </li>
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

    return (
      <li className="expression-input-container">
        <input
          className="input-expression"
          type="text"
          placeholder={L10N.getStr("expressions.placeholder")}
          onBlur={e => (e.target.value = "")}
          onKeyPress={onKeyPress}
        />
      </li>
    );
  }

  render() {
    const { expressions } = this.props;
    return (
      <ul className="pane expressions-list">
        {expressions.map(this.renderExpression)}
        {this.renderNewExpressionInput()}
      </ul>
    );
  }
}

Expressions.displayName = "Expressions";

export default connect(
  state => ({
    pauseInfo: getPause(state),
    expressions: getVisibleExpressions(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
