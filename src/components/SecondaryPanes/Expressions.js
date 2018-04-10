/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { ObjectInspector } from "devtools-reps";

import actions from "../../actions";
import { getExpressions, getExpressionError } from "../../selectors";
import { getValue } from "../../utils/expressions";
import { createObjectClient } from "../../client/firefox";

import CloseButton from "../shared/Button/Close";

import type { List } from "immutable";
import type { Expression } from "../../types";

import "./Expressions.css";

type State = {
  editing: boolean,
  editIndex: number,
  inputValue: string
};

type Props = {
  expressions: List<Expression>,
  expressionError: boolean,
  addExpression: (input: string) => void,
  clearExpressionError: () => void,
  evaluateExpressions: () => void,
  updateExpression: (input: string, expression: Expression) => void,
  deleteExpression: (expression: Expression) => void,
  openLink: (url: string) => void,
  showInput: boolean,
  onExpressionAdded: () => void
};

class Expressions extends Component<Props, State> {
  _input: ?HTMLInputElement;
  renderExpression: (
    expression: Expression,
    index: number
  ) => React$Element<"li">;

  constructor(props: Props) {
    super(props);

    this.state = {
      editing: false,
      editIndex: -1,
      inputValue: ""
    };
  }

  componentDidMount() {
    const { expressions, evaluateExpressions } = this.props;
    if (expressions.size > 0) {
      evaluateExpressions();
    }
  }

  clear = () => {
    this.setState(() => {
      this.props.clearExpressionError();
      return { editing: false, editIndex: -1, inputValue: "" };
    });
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.editing && !nextProps.expressionError) {
      this.clear();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { editing, inputValue } = this.state;
    const { expressions, expressionError, showInput } = this.props;

    return (
      expressions !== nextProps.expressions ||
      expressionError !== nextProps.expressionError ||
      editing !== nextState.editing ||
      inputValue !== nextState.inputValue ||
      nextProps.showInput !== showInput
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._input && !prevState.editing) {
      const input = this._input;
      input.setSelectionRange(0, input.value.length);
      input.focus();
    }
  }

  editExpression(expression: Expression, index: number) {
    this.setState({
      inputValue: expression.input,
      editing: true,
      editIndex: index
    });
  }

  deleteExpression(
    e: SyntheticMouseEvent<HTMLDivElement>,
    expression: Expression
  ) {
    e.stopPropagation();
    const { deleteExpression } = this.props;
    deleteExpression(expression);
  }

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  handleKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      this.clear();
    }
  };

  hideInput = () => {
    this.props.onExpressionAdded();
  };

  onBlur() {
    this.clear();
    this.hideInput();
  }

  handleExistingSubmit = async (
    e: SyntheticEvent<HTMLFormElement>,
    expression: Expression
  ) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.updateExpression(this.state.inputValue, expression);
    this.hideInput();
  };

  handleNewSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    const { inputValue } = this.state;
    e.preventDefault();
    e.stopPropagation();

    this.props.clearExpressionError();
    await this.props.addExpression(this.state.inputValue);
    this.setState({
      editing: false,
      editIndex: -1,
      inputValue: this.props.expressionError ? inputValue : ""
    });

    if (!this.props.expressionError) {
      this.hideInput();
    }
  };

  renderExpression = (expression: Expression, index: number) => {
    const { expressionError, openLink } = this.props;
    const { editing, editIndex } = this.state;
    const { input, updating } = expression;
    const isEditingExpr = editing && editIndex === index;
    if (isEditingExpr || (isEditingExpr && expressionError)) {
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
      <li
        className="expression-container"
        key={input}
        onDoubleClick={(items, options) =>
          this.editExpression(expression, index)
        }
      >
        <div className="expression-content">
          <ObjectInspector
            roots={[root]}
            autoExpandDepth={0}
            disableWrap={true}
            disabledFocus={true}
            openLink={openLink}
            createObjectClient={grip => createObjectClient(grip)}
          />
          <div className="expression-container__close-btn">
            <CloseButton
              handleClick={e => this.deleteExpression(e, expression)}
            />
          </div>
        </div>
      </li>
    );
  };

  renderNewExpressionInput() {
    const { expressionError } = this.props;
    const { editing, inputValue } = this.state;
    const error = editing === false && expressionError === true;
    const placeholder: string = error
      ? L10N.getStr("expressions.errorMsg")
      : L10N.getStr("expressions.placeholder");
    return (
      <li className="expression-input-container">
        <form className="expression-input-form" onSubmit={this.handleNewSubmit}>
          <input
            className={classnames("input-expression", { error })}
            type="text"
            placeholder={placeholder}
            onChange={this.handleChange}
            onBlur={this.hideInput}
            onKeyDown={this.handleKeyDown}
            autoFocus="true"
            value={!editing ? inputValue : ""}
          />
          <input type="submit" style={{ display: "none" }} />
        </form>
      </li>
    );
  }

  renderExpressionEditInput(expression: Expression) {
    const { expressionError } = this.props;
    const { inputValue, editing } = this.state;
    const error = editing === true && expressionError === true;
    return (
      <span className="expression-input-container" key={expression.input}>
        <form
          className="expression-input-form"
          onSubmit={(e: SyntheticEvent<HTMLFormElement>) =>
            this.handleExistingSubmit(e, expression)
          }
        >
          <input
            className={classnames("input-expression", { error })}
            type="text"
            onChange={this.handleChange}
            onBlur={this.clear}
            onKeyDown={this.handleKeyDown}
            value={editing ? inputValue : expression.input}
            ref={c => (this._input = c)}
          />
          <input type="submit" style={{ display: "none" }} />
        </form>
      </span>
    );
  }

  render() {
    const { expressions, showInput } = this.props;

    return (
      <ul className="pane expressions-list">
        {expressions.map(this.renderExpression)}
        {showInput && this.renderNewExpressionInput()}
      </ul>
    );
  }
}

export default connect(
  state => ({
    expressions: getExpressions(state),
    expressionError: getExpressionError(state)
  }),
  actions
)(Expressions);
