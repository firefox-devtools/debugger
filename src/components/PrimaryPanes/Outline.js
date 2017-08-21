// @flow

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import actions from "../../actions";
import { getSelectedSource, getSymbols } from "../../selectors";
import { isEnabled } from "devtools-config";
import "./Outline.css";
import previewFunction from "../shared/previewFunction";

import type {
  SymbolDeclarations,
  SymbolDeclaration
} from "../../utils/parser/getSymbols";
import type { SourceRecord } from "../../reducers/sources";

type State = any;
type Props = {
  isHidden: boolean,
  symbols: SymbolDeclarations,
  selectSource: (string, { line: number }) => void,
  selectedSource: ?SourceRecord
};

class Outline extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  selectItem(location) {
    const { selectedSource, selectSource } = this.props;
    if (!selectedSource) {
      return;
    }
    const selectedSourceId = selectedSource.get("id");
    const startLine = location.start.line;
    selectSource(selectedSourceId, { line: startLine });
  }

  renderFunction(func: SymbolDeclaration) {
    const { name, location } = func;

    return (
      <li
        key={`${name}:${location.start.line}:${location.start.column}`}
        className="outline-list__element"
        onClick={() => this.selectItem(location)}
      >
        {previewFunction({ name })}
      </li>
    );
  }

  renderFunctions() {
    const { symbols } = this.props;

    return symbols.functions
      .filter(func => func.name != "anonymous")
      .map(func => this.renderFunction(func));
  }

  render() {
    const { isHidden } = this.props;
    if (!isEnabled("outline")) {
      return null;
    }

    return (
      <div className={classnames("outline", { hidden: isHidden })}>
        <ul className="outline-list">
          {this.renderFunctions()}
        </ul>
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
