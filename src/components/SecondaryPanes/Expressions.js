/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { features } from "../../utils/prefs";
import { objectInspector } from "devtools-reps";

import actions from "../../actions";
import {
  getExpressions,
  getExpressionError,
  getAutocompleteMatchset
} from "../../selectors";
import { getValue } from "../../utils/expressions";
import { createObjectClient } from "../../client/firefox";

import { CloseButton } from "../shared/Button";
import { debounce } from "lodash";

import type { List } from "immutable";
import type { Expression } from "../../types";

import "./Expressions.css";

const { ObjectInspector } = objectInspector;

type State = {
  editing: boolean,
  editIndex: number,
  inputValue: string,
  focused: boolean
};

type Props = {
  expressions: List<Expression>,
  expressionError: boolean,
  showInput: boolean,
  autocompleteMatches: string[],
  autocomplete: (input: string, cursor: number) => Promise<any>,
  clearAutocomplete: () => void,
  onExpressionAdded: () => void,
  addExpression: (input: string) => void,
  clearExpressionError: () => void,
  evaluateExpressions: () => void,
  updateExpression: (input: string, expression: Expression) => void,
  deleteExpression: (expression: Expression) => void,
  openLink: (url: string) => void
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
      inputValue: "",
      focused: false
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
    const { editing, inputValue, focused } = this.state;
    const {
      expressions,
      expressionError,
      showInput,
      autocompleteMatches
    } = this.props;

    return (
      autocompleteMatches !== nextProps.autocompleteMatches ||
      expressions !== nextProps.expressions ||
      expressionError !== nextProps.expressionError ||
      editing !== nextState.editing ||
      inputValue !== nextState.inputValue ||
      nextProps.showInput !== showInput ||
      focused !== nextState.focused
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const input = this._input;

    if (!input) {
      return;
    }

    if (!prevState.editing && this.state.editing) {
      input.setSelectionRange(0, input.value.length);
      input.focus();
    } else if (this.props.showInput && !this.state.focused) {
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
    const target = e.target;
    if (features.autocompleteExpression) {
      this.findAutocompleteMatches(target.value, target.selectionStart);
    }
    this.setState({ inputValue: target.value });
  };

  findAutocompleteMatches = debounce((value, selectionStart) => {
    const { autocomplete } = this.props;
    autocomplete(value, selectionStart);
  }, 250);

  handleKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      this.clear();
    }
  };

  hideInput = () => {
    this.setState({ focused: false });
    this.props.onExpressionAdded();
  };

  onFocus = () => {
    this.setState({ focused: true });
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

    this.props.clearAutocomplete();
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
        title={expression.input}
        onDoubleClick={(items, options) =>
          this.editExpression(expression, index)
        }
      >
        <div className="expression-content">
          <ObjectInspector
            roots={[root]}
            autoExpandDepth={0}
            disableWrap={true}
            focusable={false}
            openLink={openLink}
            createObjectClient={grip => createObjectClient(grip)}
          />
          <div className="expression-container__close-btn">
            <CloseButton
              handleClick={e => this.deleteExpression(e, expression)}
              tooltip={L10N.getStr("expressions.remove.tooltip")}
            />
          </div>
        </div>
      </li>
    );
  };

  renderAutoCompleteMatches() {
    if (!features.autocompleteExpression) {
      return null;
    }
    const { autocompleteMatches } = this.props;
    if (autocompleteMatches) {
      return (
        <datalist id="autocomplete-matches">
          {autocompleteMatches.map((match, index) => {
            return <option key={index} value={match} />;
          })}
        </datalist>
      );
    }
    return <datalist id="autocomplete-matches" />;
  }

  renderNewExpressionInput() {
    const { expressionError, showInput } = this.props;
    const { editing, inputValue, focused } = this.state;
    const error = editing === false && expressionError === true;
    const placeholder: string = error
      ? L10N.getStr("expressions.errorMsg")
      : L10N.getStr("expressions.placeholder");

    return (
      <li
        className={classnames("expression-input-container", { focused, error })}
      >
        <form className="expression-input-form" onSubmit={this.handleNewSubmit}>
          <input
            className="input-expression"
            type="text"
            placeholder={placeholder}
            onChange={this.handleChange}
            onBlur={this.hideInput}
            onKeyDown={this.handleKeyDown}
            onFocus={this.onFocus}
            autoFocus={showInput}
            value={!editing ? inputValue : ""}
            ref={c => (this._input = c)}
            {...features.autocompleteExpression && {
              list: "autocomplete-matches"
            }}
          />
          {this.renderAutoCompleteMatches()}
          <input type="submit" style={{ display: "none" }} />
        </form>
      </li>
    );
  }

  renderExpressionEditInput(expression: Expression) {
    const { expressionError } = this.props;
    const { inputValue, editing, focused } = this.state;
    const error = editing === true && expressionError === true;

    return (
      <span
        className={classnames("expression-input-container", { focused, error })}
        key={expression.input}
      >
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
            onFocus={this.onFocus}
            value={editing ? inputValue : expression.input}
            ref={c => (this._input = c)}
            {...features.autocompleteExpression && {
              list: "autocomplete-matches"
            }}
          />
          {this.renderAutoCompleteMatches()}
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
        {(showInput || !expressions.size) && this.renderNewExpressionInput()}
      </ul>
    );
  }
}

const mapStateToProps = state => {
  return {
    autocompleteMatches: getAutocompleteMatchset(state),
    expressions: getExpressions(state),
    expressionError: getExpressionError(state)
  };
};

export default connect(
  mapStateToProps,
  {
    autocomplete: actions.autocomplete,
    clearAutocomplete: actions.clearAutocomplete,
    onExpressionAdded: actions.onExpressionAdded,
    addExpression: actions.addExpression,
    clearExpressionError: actions.clearExpressionError,
    evaluateExpressions: actions.evaluateExpressions,
    updateExpression: actions.updateExpression,
    deleteExpression: actions.deleteExpression,
    openLink: actions.openLink
  }
)(Expressions);
