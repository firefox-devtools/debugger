/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { getSelectedSource, getSymbols } from "../../selectors";

import "./Outline.css";
import PreviewFunction from "../shared/PreviewFunction";
import { uniq } from "lodash";
import type {
  SymbolDeclarations,
  SymbolDeclaration
} from "../../workers/parser/getSymbols";
import type { AstLocation } from "../../workers/parser/types";
import type { SourceRecord } from "../../reducers/sources";

type Props = {
  symbols: SymbolDeclarations,
  selectLocation: ({ sourceId: string, line: number }) => void,
  selectedSource: ?SourceRecord
};

export class Outline extends Component<Props> {
  selectItem(location: AstLocation) {
    const { selectedSource, selectLocation } = this.props;
    if (!selectedSource) {
      return;
    }
    const selectedSourceId = selectedSource.get("id");
    const startLine = location.start.line;
    selectLocation({ sourceId: selectedSourceId, line: startLine });
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
        <span className="outline-list__element-icon">λ</span>
        <PreviewFunction func={{ name, parameterNames }} />
      </li>
    );
  }

  renderClassFunctions(klass: string, functions: SymbolDeclaration[]) {
    if (klass == null || functions.length == 0) {
      return null;
    }

    const classFunc = functions.find(func => func.name === klass);
    const classFunctions = functions.filter(func => func.klass === klass);

    return (
      <div className="outline-list__class" key={klass}>
        <h2>{classFunc ? this.renderFunction(classFunc) : `class ${klass}`}</h2>
        <ul className="outline-list__class-list">
          {classFunctions.map(func => this.renderFunction(func))}
        </ul>
      </div>
    );
  }

  renderFunctions(functions: Array<SymbolDeclaration>) {
    const classes = uniq(functions.map(func => func.klass));
    const namedFunctions = functions.filter(
      func =>
        func.name != "anonymous" && !func.klass && !classes.includes(func.name)
    );

    const classFunctions = functions.filter(
      func => func.name != "anonymous" && !!func.klass
    );

    return (
      <ul className="outline-list">
        {namedFunctions.map(func => this.renderFunction(func))}
        {classes.map(klass => this.renderClassFunctions(klass, classFunctions))}
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
          ? this.renderFunctions(symbols.functions)
          : this.renderPlaceholder()}
      </div>
    );
  }
}

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
