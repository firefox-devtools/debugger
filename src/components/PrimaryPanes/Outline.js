/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { showMenu } from "devtools-contextmenu";
import { connect } from "react-redux";

import { copyToTheClipboard } from "../../utils/clipboard";
import { findFunctionText } from "../../utils/function";

import actions from "../../actions";
import {
  getSelectedSource,
  getSymbols,
  getSelectedLocation
} from "../../selectors";

import "./Outline.css";
import PreviewFunction from "../shared/PreviewFunction";
import { uniq, sortBy } from "lodash";

import type {
  AstLocation,
  SymbolDeclarations,
  SymbolDeclaration,
  FunctionDeclaration
} from "../../workers/parser";
import type { SourceRecord } from "../../types";

type Props = {
  symbols: SymbolDeclarations,
  selectLocation: ({ sourceId: string, line: number }) => void,
  selectedSource: ?SourceRecord,
  onAlphabetizeClick: Function,
  alphabetizeOutline: boolean,
  getFunctionText: Function,
  flashLineRange: Function,
  selectedLocation: any
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

  onContextMenu(event: SyntheticEvent<HTMLElement>, func: SymbolDeclaration) {
    event.stopPropagation();
    event.preventDefault();

    const {
      selectedSource,
      getFunctionText,
      flashLineRange,
      selectedLocation
    } = this.props;

    const copyFunctionKey = L10N.getStr("copyFunction.accesskey");
    const copyFunctionLabel = L10N.getStr("copyFunction.label");

    if (!selectedSource) {
      return;
    }

    const sourceLine = func.location.start.line;
    const functionText = getFunctionText(sourceLine);

    const copyFunctionItem = {
      id: "node-menu-copy-function",
      label: copyFunctionLabel,
      accesskey: copyFunctionKey,
      disabled: !functionText,
      click: () => {
        flashLineRange({
          start: func.location.start.line,
          end: func.location.end.line,
          sourceId: selectedLocation.sourceId
        });
        return copyToTheClipboard(functionText);
      }
    };
    const menuOptions = [copyFunctionItem];
    showMenu(event, menuOptions);
  }

  renderPlaceholder() {
    const placeholderMessage = this.props.selectedSource
      ? L10N.getStr("outline.noFunctions")
      : L10N.getStr("outline.noFileSelected");

    return <div className="outline-pane-info">{placeholderMessage}</div>;
  }

  renderLoading() {
    return (
      <div className="outline-pane-info">{L10N.getStr("loadingText")}</div>
    );
  }

  renderFunction(func: FunctionDeclaration) {
    const { name, location, parameterNames } = func;

    return (
      <li
        key={`${name}:${location.start.line}:${location.start.column}`}
        className="outline-list__element"
        onClick={() => this.selectItem(location)}
        onContextMenu={e => this.onContextMenu(e, func)}
      >
        <span className="outline-list__element-icon">λ</span>
        <PreviewFunction func={{ name, parameterNames }} />
      </li>
    );
  }

  renderClassFunctions(klass: string, functions: FunctionDeclaration[]) {
    if (klass == null || functions.length == 0) {
      return null;
    }

    const classFunc = functions.find(func => func.name === klass);
    const classFunctions = functions.filter(func => func.klass === klass);
    const classInfo = this.props.symbols.classes.find(c => c.name === klass);

    const heading = classFunc ? (
      <h2>{this.renderFunction(classFunc)}</h2>
    ) : (
      <h2
        onClick={classInfo ? () => this.selectItem(classInfo.location) : null}
      >
        <span className="keyword">class</span> {klass}
      </h2>
    );

    return (
      <div className="outline-list__class" key={klass}>
        {heading}
        <ul className="outline-list__class-list">
          {classFunctions.map(func => this.renderFunction(func))}
        </ul>
      </div>
    );
  }

  renderFunctions(functions: Array<FunctionDeclaration>) {
    let classes = uniq(functions.map(func => func.klass));
    let namedFunctions = functions.filter(
      func =>
        func.name != "anonymous" && !func.klass && !classes.includes(func.name)
    );

    let classFunctions = functions.filter(
      func => func.name != "anonymous" && !!func.klass
    );

    if (this.props.alphabetizeOutline) {
      namedFunctions = sortBy(namedFunctions, "name");
      classes = sortBy(classes, "klass");
      classFunctions = sortBy(classFunctions, "name");
    }

    return (
      <div>
        <ul className="outline-list">
          {namedFunctions.map(func => this.renderFunction(func))}
          {classes.map(klass =>
            this.renderClassFunctions(klass, classFunctions)
          )}
        </ul>
        <div className="outline-footer bottom">
          <button
            onClick={() => {
              this.props.onAlphabetizeClick();
            }}
            className={this.props.alphabetizeOutline ? "active" : ""}
          >
            {L10N.getStr("outline.sortLabel")}
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { symbols, selectedSource } = this.props;
    if (!selectedSource) {
      return this.renderPlaceholder();
    }
    if (!symbols || symbols.loading) {
      return this.renderLoading();
    }
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
      selectedSource,
      selectedLocation: getSelectedLocation(state),
      getFunctionText: line =>
        findFunctionText(
          line,
          selectedSource.toJS(),
          getSymbols(state, selectedSource.toJS())
        )
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
