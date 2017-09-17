// @flow

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { getSelectedSource, getSymbols } from "../../selectors";
import "./Outline.css";
import PreviewFunction from "../shared/PreviewFunction";

import type {
  SymbolDeclarations,
  SymbolDeclaration
} from "../../utils/parser/getSymbols";
import type { AstLocation } from "../../utils/parser/types";
import type { SourceRecord } from "../../reducers/sources";

export class Outline extends Component {
  state: any;

  props: {
    symbols: SymbolDeclarations,
    selectSource: (string, { line: number }) => void,
    selectedSource: ?SourceRecord
  };

  selectItem(location: AstLocation) {
    const { selectedSource, selectSource } = this.props;
    if (!selectedSource) {
      return;
    }
    const selectedSourceId = selectedSource.get("id");
    const startLine = location.start.line;
    selectSource(selectedSourceId, { line: startLine });
  }

  renderPlaceholder() {
    return (
      <div className="outline-pane-info">
        {L10N.getStr("outline.noFunctions")}
      </div>
    );
  }

  renderFunction(func: SymbolDeclaration) {
    const { name, location, parameterNames } = func;

    return (
      <li
        key={`${name}:${location.start.line}:${location.start.column}`}
        className="outline-list__element"
        onClick={() => this.selectItem(location)}
      >
        <PreviewFunction func={{ name, parameterNames }} />
      </li>
    );
  }

  renderFunctions(symbols: Array<SymbolDeclaration>) {
    return (
      <ul className="outline-list">
        {symbols.map(func => this.renderFunction(func))}
      </ul>
    );
  }

  render() {
    const { symbols } = this.props;

    const symbolsToDisplay = symbols.functions.filter(
      func => func.name != "anonymous"
    );

    return (
      <div className="outline">
        {symbolsToDisplay.length > 0
          ? this.renderFunctions(symbolsToDisplay)
          : this.renderPlaceholder()}
      </div>
    );
  }
}

Outline.displayName = "Outline";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      symbols: getSymbols(state, selectedSource && selectedSource.toJS()),
      selectedSource
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
