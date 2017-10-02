// @flow

import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { filter } from "fuzzaldrin-plus";
import {
  getActiveSearch,
  getSymbolSearchType,
  getSelectedSource,
  getSymbols
} from "../selectors";
import actions from "../actions";

import { scrollList } from "../utils/result-list";

import Modal from "./shared/Modal";

import SearchInput from "./shared/SearchInput";

import ResultList from "./shared/ResultList";

import type { ActiveSearchType, SymbolSearchType } from "../reducers/ui";
import type { SymbolDeclaration } from "../utils/parser/types";

import type { Location as BabelLocation } from "babel-traverse";
import type { SourceRecord } from "../reducers/sources";
import type { SelectSourceOptions } from "../actions/sources";

export type FormattedSymbolDeclaration = {
  id: string,
  title: string,
  subtitle: string,
  value: string,
  location: BabelLocation,
  parameterNames?: string[]
};

export type FormattedSymbolDeclarations = {
  variables: Array<FormattedSymbolDeclaration>,
  functions: Array<FormattedSymbolDeclaration>
};

function formatSymbol(symbol: SymbolDeclaration): FormattedSymbolDeclaration {
  return {
    id: `${symbol.name}:${symbol.location.start.line}`,
    title: symbol.name,
    subtitle: `:${symbol.location.start.line}`,
    value: symbol.name,
    location: symbol.location
  };
}

type SymbolModalState = {
  resultsIndex: number,
  results: ?Array<FormattedSymbolDeclaration>,
  query: ?string
};

import "./SymbolModal.css";

class SymbolModal extends Component {
  state: SymbolModalState;

  props: {
    enabled: boolean,
    selectSource: (string, ?SelectSourceOptions) => void,
    selectedSource?: SourceRecord,
    symbols: FormattedSymbolDeclarations,
    symbolType: SymbolSearchType,
    setActiveSearch: (?ActiveSearchType) => void,
    closeActiveSearch: () => void,
    highlightLineRange: ({ start: number, end: number }) => void,
    clearHighlightLineRange: () => void,
    symbolSearchResults: any
  };

  constructor(props) {
    super(props);
    this.state = { results: null, query: "", resultsIndex: 0 };

    this.onClick = this.onClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.updateResults = this.updateResults.bind(this);
    this.traverseResults = this.traverseResults.bind(this);
    this.renderResults = this.renderResults.bind(this);
    this.buildSummaryMsg = this.buildSummaryMsg.bind(this);
    this.buildPlaceHolder = this.buildPlaceHolder.bind(this);
    this.selectResultItem = this.selectResultItem.bind(this);
  }

  componentDidMount() {
    this.updateResults(this.state.query);
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.resultsIndex);
    }

    if (!prevProps.enabled && this.props.enabled) {
      this.updateResults(this.state.query);
    }
  }

  onClick(e: SyntheticEvent) {
    e.stopPropagation();
  }

  onChange(e: SyntheticInputEvent) {
    const { selectedSource } = this.props;
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    this.setState({ query: e.target.value });
    return this.updateResults(e.target.value);
  }

  closeModal() {
    this.props.closeActiveSearch();
    this.props.clearHighlightLineRange();
  }

  selectResultItem(e: SyntheticEvent, item: ?FormattedSymbolDeclaration) {
    const { selectSource, selectedSource } = this.props;

    if (!selectedSource || !item) {
      return;
    }

    selectSource(selectedSource.get("id"), {
      line: item.location.start.line
    });

    this.closeModal();
  }

  updateResults(query) {
    const { symbolType, symbols } = this.props;

    let symbolSearchResults = symbols[symbolType];
    if (query == "") {
      this.setState({ results: symbolSearchResults });
      return;
    }

    symbolSearchResults = filter(symbolSearchResults, query, {
      key: "value"
    });

    this.setState({ results: symbolSearchResults });
  }

  traverseResults(direction: number) {
    const { resultsIndex, results } = this.state;
    const resultCount = this.resultsCount();
    const index = resultsIndex + direction;
    const nextIndex = (index + resultCount) % resultCount;

    this.setState({ resultsIndex: nextIndex });

    if (results) {
      this.onSelectResultItem(results[nextIndex]);
    }
  }

  onSelectResultItem(item: FormattedSymbolDeclaration) {
    const {
      selectSource,
      selectedSource,
      symbolType,
      highlightLineRange
    } = this.props;

    if (selectedSource && symbolType !== "functions") {
      selectSource(selectedSource.get("id"), {
        line: item.location.start.line
      });
    }

    if (selectedSource && symbolType === "functions") {
      highlightLineRange({
        start: item.location.start.line,
        end: item.location.end.line,
        sourceId: selectedSource.get("id")
      });
    }
  }

  onKeyUp(e: SyntheticKeyboardEvent) {
    e.preventDefault();
    const { enabled } = this.props;
    const { results, resultsIndex } = this.state;

    if (!enabled || !results) {
      return;
    }

    if (e.key === "ArrowUp") {
      this.traverseResults(-1);
    } else if (e.key === "ArrowDown") {
      this.traverseResults(1);
    } else if (e.key === "Enter") {
      this.selectResultItem(e, results[resultsIndex]);
      this.closeModal();
    } else if (e.key === "Tab") {
      this.closeModal();
    }
  }

  renderResults() {
    const { resultsIndex, results } = this.state;

    const { enabled } = this.props;
    if (!enabled || !results) {
      return null;
    }

    return (
      <ResultList
        key="results"
        items={results}
        selected={resultsIndex}
        selectItem={this.selectResultItem}
        ref="resultList"
      />
    );
  }

  renderInput() {
    const { query } = this.state;

    return (
      <div key="input" className="input-wrapper">
        <SearchInput
          query={query}
          count={this.resultsCount()}
          placeholder={this.buildPlaceHolder()}
          summaryMsg={this.buildSummaryMsg()}
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          handleNext={() => this.traverseResults(1)}
          handlePrev={() => this.traverseResults(-1)}
          handleClose={this.closeModal}
        />
      </div>
    );
  }

  buildSummaryMsg() {
    const { resultsIndex } = this.state;
    const count = this.resultsCount();

    if (count > 1) {
      return L10N.getFormatStr("editor.searchResults", resultsIndex + 1, count);
    } else if (count === 1) {
      return L10N.getFormatStr("editor.singleResult");
    }
  }

  resultsCount() {
    return this.state.results ? this.state.results.length : 0;
  }

  buildPlaceHolder() {
    const { symbolType } = this.props;
    return L10N.getFormatStr(`symbolSearch.search.${symbolType}Placeholder`);
  }

  render() {
    const { enabled } = this.props;

    if (!enabled) {
      return null;
    }

    return (
      <Modal in={enabled} handleClose={this.closeModal}>
        {this.renderInput()}
        {this.renderResults()}
      </Modal>
    );
  }
}

SymbolModal.contextTypes = {
  shortcuts: PropTypes.object
};

function _getFormattedSymbols(state, source) {
  if (!source) {
    return { variables: [], functions: [] };
  }

  const { variables, functions } = getSymbols(state, source.toJS());

  return {
    variables: variables.map(formatSymbol),
    functions: functions.map(formatSymbol)
  };
}

export default connect(
  state => {
    const source = getSelectedSource(state);
    return {
      enabled: Boolean(getActiveSearch(state) === "symbol" && source),
      symbolType: getSymbolSearchType(state),
      symbols: _getFormattedSymbols(state, source)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SymbolModal);
