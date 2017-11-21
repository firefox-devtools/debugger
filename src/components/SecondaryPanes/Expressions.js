/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import { getExpressions, getLoadedObjects, getPause } from "../../selectors";
import { getValue } from "../../utils/expressions";

import CloseButton from "../shared/Button/Close";
import { ObjectInspector } from "devtools-reps";

import "./Expressions.css";

import type { List } from "immutable";
import type { Expression } from "../../types";

type State = {
  editing: null | Node
};

type Props = {
  expressions: List<Expression>,
  addExpression: (string, ?Object) => void,
  evaluateExpressions: () => void,
  updateExpression: (string, Expression) => void,
  deleteExpression: Expression => void,
  loadObjectProperties: () => void,
  loadedObjects: Map<string, any>,
  openLink: (url: string) => void
};

class Expressions extends PureComponent<Props, State> {
  _input: null | any;
  renderExpression: Function;

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
    const { loadObjectProperties, loadedObjects, openLink } = this.props;
    const { editing } = this.state;
    const { input, updating } = expression;

    if (editing == input) {
      return this.renderExpressionEditInput(expression);
    }

    if (updating) {
      return;
    }

    const { value } = getValue(expression);

    const root = {
      name: expression.input,
      path: input,
      contents: { value }
    };

    return (
      <li className="expression-container" key={input}>
        <div className="expression-content">
          <ObjectInspector
            roots={[root]}
            autoExpandDepth={0}
            disableWrap={true}
            disabledFocus={true}
            onDoubleClick={(items, options) =>
              this.editExpression(expression, options)}
            openLink={openLink}
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

export default connect(
  state => ({
    pauseInfo: getPause(state),
    expressions: getExpressions(state),
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
