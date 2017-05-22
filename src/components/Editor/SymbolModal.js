// @flow

import { DOM as dom, createFactory, Component, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { filter } from "fuzzaldrin-plus";
import {
  getActiveSearchState,
  getSymbolSearchType,
  getSelectedSource,
  getSymbols,
  getSymbolSearchResults,
  getSymbolSearchQueryState
} from "../../selectors";
import actions from "../../actions";

import { scrollList } from "../../utils/result-list";

import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

import _ResultList from "../shared/ResultList";
const ResultList = createFactory(_ResultList);

import type { ActiveSearchType, SymbolSearchType } from "../../reducers/ui";
import type {
  SymbolDeclaration,
  SymbolDeclarations
} from "../../utils/parser/getSymbols";
import type { Location as BabelLocation } from "babel-traverse";
import type { SearchResults } from ".";

export type FormattedSymbolDeclaration = {
  id: string,
  title: string,
  subtitle: string,
  value: string,
  location: BabelLocation,
  parameterNames?: string[]
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
  symbolSearchResults: Array<any>,
  selectedResultIndex: number,
  count: number,
  index: number
};

import "./SymbolModal.css";

class SymbolModal extends Component {
  state: SymbolModalState;

  props: {
    enabled: boolean,
    query: string,
    selectSource: (string, ?SelectSourceOptions) => any,
    selectedSource?: SourceRecord,
    symbols: SymbolDeclarations,
    searchResults: SearchResults,
    symbolType: SymbolSearchType,
    setSelectedSymbolType: SymbolSearchType => any,
    toggleActiveSearch: (?ActiveSearchType) => any,
    setSymbolSearchQuery: string => any,
    updateSymbolSearchResults: ({ count: number, index?: number }) => any
  };

  constructor(props) {
    super(props);
    this.state = {
      symbolSearchResults: [],
      selectedResultIndex: 0,
      count: 0,
      index: -1
    };

    const self = this;
    self.onEscape = this.onEscape.bind(this);
    self.onChange = this.onChange.bind(this);
    self.updateResults = this.updateResults.bind(this);
    self.traverseResults = this.traverseResults.bind(this);
    self.renderResults = this.renderResults.bind(this);
    self.buildSummaryMsg = this.buildSummaryMsg.bind(this);
    self.buildPlaceHolder = this.buildPlaceHolder.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("Escape");
    shortcuts.off(L10N.getStr("symbolSearch.search.key2"));
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("Escape", (_, e) => this.onEscape(e));
    shortcuts.on(L10N.getStr("symbolSearch.search.key2"), (_, e) => {
      this.props.toggleActiveSearch("symbol");
      this.props.setSelectedSymbolType("functions");
    });
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }
  }

  onEscape(e: SyntheticEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.props.toggleActiveSearch();
  }

  onChange(e: SyntheticEvent) {
    const { selectedSource, setSymbolSearchQuery } = this.props;
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    setSymbolSearchQuery(e.target.value);

    return this.updateResults(e.target.value);
  }

  updateResults(query: string) {
    const {
      selectedSource,
      updateSearchResults,
      updateSymbolSearchResults,
      symbolType,
      symbols
    } = this.props;

    console.log(query, selectedSource);

    if (query == "" || !selectedSource) {
      return;
    }

    const symbolSearchResults = filter(symbols[symbolType], query, {
      key: "value"
    });

    updateSearchResults({ count: symbolSearchResults.length });
    updateSymbolSearchResults(symbolSearchResults);
  }

  traverseResults(rev: boolean) {
    const { symbolSearchResults, selectedResultIndex } = this.state;
    const searchResults = symbolSearchResults;
    const resultCount = searchResults.length;

    if (rev) {
      let nextResultIndex = Math.max(0, selectedResultIndex - 1);

      if (selectedResultIndex === 0) {
        nextResultIndex = resultCount - 1;
      }
      this.setState({ selectedResultIndex: nextResultIndex });
      this.onSelectResultItem(searchResults[nextResultIndex]);
    } else {
      let nextResultIndex = Math.min(resultCount - 1, selectedResultIndex + 1);

      if (selectedResultIndex === resultCount - 1) {
        nextResultIndex = 0;
      }
      this.setState({ selectedResultIndex: nextResultIndex });
      this.onSelectResultItem(searchResults[nextResultIndex]);
    }
  }

  onKeyDown(e: SyntheticKeyboardEvent) {
    const { enabled, query } = this.props;
    const { symbolSearchResults } = this.state;
    if (!enabled || query == "") {
      return;
    }

    const searchResults = symbolSearchResults;

    if (e.key === "ArrowUp") {
      this.traverseResults(true);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      this.traverseResults(false);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (searchResults.length) {
        this.selectResultItem(e, searchResults[this.state.selectedResultIndex]);
      }
      this.closeSearch(e);
      e.preventDefault();
    } else if (e.key === "Tab") {
      this.closeSearch(e);
      e.preventDefault();
    }
  }

  renderResults() {
    const { symbolSearchResults } = this.props;
    const { selectedResultIndex } = this.state;

    const { query, enabled } = this.props;
    if (query == "" || !enabled || !symbolSearchResults.length) {
      return;
    }

    return ResultList({
      items: symbolSearchResults,
      selected: selectedResultIndex,
      selectItem: this.selectResultItem,
      ref: "resultList"
    });
  }

  buildSummaryMsg() {
    if (this.state.symbolSearchResults.length > 1) {
      return L10N.getFormatStr(
        "editor.searchResults",
        this.state.selectedResultIndex + 1,
        this.state.symbolSearchResults.length
      );
    } else if (this.state.symbolSearchResults.length === 1) {
      return L10N.getFormatStr("editor.singleResult");
    }
  }

  buildPlaceHolder() {
    const { symbolType } = this.props;
    return L10N.getFormatStr(`symbolSearch.search.${symbolType}Placeholder`);
  }

  render() {
    const { enabled, query } = this.props;
    if (!enabled) {
      return dom.div();
    }
    return dom.div(
      { className: "symbol-modal" },
      SearchInput({
        query,
        count: 0,
        placeholder: this.buildPlaceHolder(),
        summaryMsg: this.buildSummaryMsg(),
        onChange: this.onChange,
        onKeyUp: this.onKeyUp,
        handleNext: e => this.traverseResults(e, false),
        handlePrev: e => this.traverseResults(e, true),
        handleClose: this.closeSearch
      }),
      this.renderResults()
    );
  }
}

SymbolModal.displayName = "SymbolModal";
SymbolModal.contextTypes = {
  shortcuts: PropTypes.object
};

function _getFormattedSymbols(state) {
  const source = getSelectedSource(state);
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
  state => ({
    query: getSymbolSearchQueryState(state),
    enabled: getActiveSearchState(state) === "symbol",
    symbolType: getSymbolSearchType(state),
    symbols: _getFormattedSymbols(state),
    symbolSearchResults: getSymbolSearchResults(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SymbolModal);
