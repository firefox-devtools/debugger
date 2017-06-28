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
import type { SourceRecord } from "../../reducers/sources";
import type { SelectSourceOptions } from "../../actions/sources";

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

type SymbolModalState = { selectedResultIndex: number };

import "./SymbolModal.css";

class SymbolModal extends Component {
  state: SymbolModalState;

  props: {
    enabled: boolean,
    query: string,
    selectSource: (string, ?SelectSourceOptions) => any,
    selectedSource?: SourceRecord,
    symbols: SymbolDeclarations,
    symbolType: SymbolSearchType,
    setSelectedSymbolType: SymbolSearchType => any,
    toggleActiveSearch: (?ActiveSearchType) => any,
    setSymbolSearchQuery: string => any,
    updateSymbolSearchResults: any,
    highlightLineRange: ({ start: number, end: number }) => void,
    clearHighlightLineRange: () => void,
    symbolSearchResults: any
  };

  constructor(props) {
    super(props);
    this.state = { selectedResultIndex: 0 };

    const self: any = this;
    self.onEscape = this.onEscape.bind(this);
    self.closeModal = this.closeModal.bind(this);
    self.onChange = this.onChange.bind(this);
    self.onKeyUp = this.onKeyUp.bind(this);
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
    this.props.toggleActiveSearch();
  }

  onChange(e: SyntheticInputEvent) {
    const {
      selectedSource,
      setSymbolSearchQuery,
      setSelectedSymbolType
    } = this.props;
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    if (e.target.value[0] === "@") {
      setSelectedSymbolType("functions");
    } else if (e.target.value[0] === "#") {
      setSelectedSymbolType("variables");
    }

    setSymbolSearchQuery(e.target.value);

    return this.updateResults(e.target.value.slice(1));
  }

  closeModal() {
    this.props.toggleActiveSearch();
    this.props.clearHighlightLineRange();
  }

  selectResultItem(e: SyntheticEvent, item: SymbolDeclaration) {
    const { selectSource, selectedSource } = this.props;

    if (!selectedSource) {
      return;
    }
    selectSource(selectedSource.get("id"), {
      line: item.location.start.line
    });

    this.closeModal();
  }

  updateResults(query: string) {
    const {
      selectedSource,
      updateSymbolSearchResults,
      symbolType,
      symbols
    } = this.props;

    if (!query || !selectedSource) {
      return;
    }

    const symbolSearchResults = filter(symbols[symbolType], query, {
      key: "value"
    });

    updateSymbolSearchResults(symbolSearchResults);
  }

  traverseResults(direction: number) {
    const { selectedResultIndex } = this.state;
    const { symbolSearchResults } = this.props;
    const searchResults = symbolSearchResults;
    const resultCount = searchResults.length;
    const index = selectedResultIndex + direction;
    const nextIndex = (index + resultCount) % resultCount;

    this.setState({ selectedResultIndex: nextIndex });
    this.onSelectResultItem(searchResults[nextIndex]);
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
    const { symbolSearchResults, enabled, query } = this.props;
    if (!enabled || query == "") {
      return;
    }

    const searchResults = symbolSearchResults;

    if (e.key === "ArrowUp") {
      this.traverseResults(-1);
    } else if (e.key === "ArrowDown") {
      this.traverseResults(1);
    } else if (e.key === "Enter") {
      if (searchResults.length) {
        this.selectResultItem(e, searchResults[this.state.selectedResultIndex]);
      }
      this.closeModal();
    } else if (e.key === "Tab") {
      this.closeModal();
    }
  }

  renderResults() {
    const { symbolSearchResults } = this.props;
    const { selectedResultIndex } = this.state;

    const { query, enabled } = this.props;
    if (!query || !enabled || !symbolSearchResults.length) {
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
    const { selectedResultIndex } = this.state;
    const count = this.resultsCount();

    if (count > 1) {
      return L10N.getFormatStr(
        "editor.searchResults",
        selectedResultIndex + 1,
        count
      );
    } else if (count === 1) {
      return L10N.getFormatStr("editor.singleResult");
    }
  }

  resultsCount() {
    return this.props.symbolSearchResults.length;
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
      dom.div(
        { className: "input-wrapper" },
        SearchInput({
          query,
          count: this.resultsCount(),
          placeholder: this.buildPlaceHolder(),
          summaryMsg: this.buildSummaryMsg(),
          onChange: this.onChange,
          onKeyUp: this.onKeyUp,
          handleNext: () => this.traverseResults(1),
          handlePrev: () => this.traverseResults(-1),
          handleClose: this.closeModal
        })
      ),
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
