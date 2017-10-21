// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { filter } from "fuzzaldrin-plus";

import actions from "../actions";
import {
  getSources,
  getQuickOpenEnabled,
  getQuickOpenQuery,
  getQuickOpenType,
  getSelectedSource,
  getSymbols
} from "../selectors";
import { scrollList } from "../utils/result-list";
import { formatSymbols, formatSources } from "../utils/quick-open";
import Modal from "./shared/Modal";
import SearchInput from "./shared/SearchInput";
import ResultList from "./shared/ResultList";

import type { SelectSourceOptions } from "../actions/sources";
import type {
  FormattedSource,
  FormattedSymbolDeclaration,
  FormattedSymbolDeclarations
} from "../utils/quick-open";
import type { SourceRecord } from "../reducers/sources";
import type { QuickOpenType } from "../reducers/quick-open";

type Props = {
  enabled: boolean,
  sources: Array<Object>,
  selectedSource?: SourceRecord,
  query: string,
  searchType: QuickOpenType,
  symbols: FormattedSymbolDeclarations,
  selectSource: (id: string, ?SelectSourceOptions) => void,
  setQuickOpenQuery: (query: string) => void,
  highlightLineRange: ({ start: number, end: number }) => void,
  clearHighlightLineRange: () => void,
  closeQuickOpen: () => void
};

type State = {
  results: ?Array<FormattedSource> | ?Array<FormattedSymbolDeclaration>,
  selectedIndex: number
};

export class QuickOpenModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      results: null,
      selectedIndex: 0
    };
  }

  componentDidMount() {
    this.updateResults(this.props.query);
  }

  componentDidUpdate(prevProps: any) {
    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedIndex);
    }

    const nowEnabled = !prevProps.enabled && this.props.enabled;
    const queryChanged = prevProps.query !== this.props.query;
    if (nowEnabled || queryChanged) {
      this.updateResults(this.props.query);
    }
  }

  closeModal = () => {
    this.props.closeQuickOpen();
    this.props.clearHighlightLineRange();
  };

  searchSources = (query: string) => {
    if (query == "") {
      const results = this.props.sources;
      this.setState({ results });
      return;
    }
    const { searchType } = this.props;

    if (searchType === "gotoSource") {
      const [baseQuery] = query.split(":");
      const results = filter(this.props.sources, baseQuery, { key: "value" });
      this.setState({ results });
    } else {
      const results = filter(this.props.sources, query, { key: "value" });
      this.setState({ results });
    }
  };

  searchSymbols = (query: string) => {
    const { symbols: { functions, variables }, searchType } = this.props;

    let results = functions;
    if (searchType === "variables") {
      results = variables;
    }
    if (query == "" || query == "@" || query == "#") {
      this.setState({ results });
      return;
    }

    results = filter(results, query.slice(1), {
      key: "value"
    });

    this.setState({ results });
  };

  updateResults = (query: string) => {
    const { searchType } = this.props;
    switch (searchType) {
      case "functions":
      case "variables":
        return this.searchSymbols(query);
      case "sources":
      case "gotoSource":
      default:
        return this.searchSources(query);
    }
  };

  selectResultItem = (
    e: SyntheticEvent<HTMLElement>,
    item: ?FormattedSource | ?FormattedSymbolDeclaration
  ) => {
    const { selectSource, selectedSource, query, searchType } = this.props;

    switch (searchType) {
      case "functions":
      case "variables":
        if (selectedSource == null || item == null) {
          return;
        }
        selectSource(selectedSource.get("id"), {
          location: {
            ...(item.location != null ? { line: item.location.start.line } : {})
          }
        });
        break;
      case "gotoSource":
        if (item == null) {
          return;
        }

        const [, line, column] = query.split(":");
        const lineNumber = parseInt(line, 10);
        const columnNumber = parseInt(column, 10);
        if (!isNaN(lineNumber)) {
          selectSource(item.id, {
            location: {
              line: lineNumber,
              ...(!isNaN(columnNumber) ? { column: columnNumber } : null)
            }
          });
          break;
        }
        break;
      case "sources":
      default:
        if (item == null) {
          return;
        }

        selectSource(item.id);
        break;
    }

    this.closeModal();
  };

  onSelectResultItem = (item: FormattedSource | FormattedSymbolDeclaration) => {
    const {
      selectSource,
      selectedSource,
      highlightLineRange,
      searchType
    } = this.props;

    if (selectedSource != null && searchType !== "functions") {
      selectSource(selectedSource.get("id"), {
        location: {
          ...(item.location != null ? { line: item.location.start.line } : {})
        }
      });
    }

    if (selectedSource != null && searchType === "functions") {
      highlightLineRange({
        ...(item.location != null
          ? { start: item.location.start.line, end: item.location.end.line }
          : {}),
        sourceId: selectedSource.get("id")
      });
    }
  };

  traverseResults = (direction: number) => {
    const { searchType } = this.props;
    const { selectedIndex, results } = this.state;
    const resultCount = this.resultCount();
    const index = selectedIndex + direction;
    const nextIndex = (index + resultCount) % resultCount;

    this.setState({ selectedIndex: nextIndex });

    const isSymbolSearch =
      searchType === "functions" || searchType === "variables";
    if (isSymbolSearch && results != null) {
      this.onSelectResultItem(results[nextIndex]);
    }
  };

  onChange = (e: SyntheticInputEvent<HTMLElement>) => {
    const { selectedSource, searchType } = this.props;
    this.props.setQuickOpenQuery(e.target.value);
    switch (searchType) {
      case "functions":
      case "variables":
        if (!selectedSource || !selectedSource.get("text")) {
          return;
        }
        this.updateResults(e.target.value);
        return;
      case "sources":
      case "gotoSource":
      default:
        this.updateResults(e.target.value);
        return;
    }
  };

  onKeyDown = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    const {
      selectSource,
      selectedSource,
      enabled,
      query,
      searchType
    } = this.props;
    const { results, selectedIndex } = this.state;

    if (!enabled || !results) {
      return;
    }

    if (e.key === "ArrowUp") {
      this.traverseResults(-1);
    } else if (e.key === "ArrowDown") {
      this.traverseResults(1);
    } else if (e.key === "Enter") {
      switch (searchType) {
        case "goto":
          if (!selectedSource) {
            return;
          }
          const [, line, column] = query.split(":");
          const lineNumber = parseInt(line, 10);
          const columnNumber = parseInt(column, 10);
          if (!isNaN(lineNumber)) {
            selectSource(selectedSource.get("id"), {
              location: {
                line: lineNumber,
                ...(!isNaN(columnNumber) ? { column: columnNumber } : null)
              }
            });
            this.closeModal();
            return;
          }
          this.closeModal();
          return;
        case "sources":
        case "functions":
        case "variables":
        default:
          this.selectResultItem(e, results[selectedIndex]);
          this.closeModal();
          return;
      }
    } else if (e.key === "Tab") {
      this.closeModal();
    }
  };

  resultCount() {
    return this.state.results ? this.state.results.length : 0;
  }

  renderResults() {
    const { enabled, searchType } = this.props;
    const { selectedIndex, results } = this.state;

    if (!enabled || !results) {
      return null;
    }

    return (
      <ResultList
        key="results"
        items={results}
        selected={selectedIndex}
        selectItem={this.selectResultItem}
        ref="resultList"
        {...(searchType === "sources" || searchType === "gotoSource"
          ? { size: "big" }
          : {})}
      />
    );
  }

  renderInput() {
    const { query, searchType } = this.props;
    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      this.resultCount()
    );

    const showSummary =
      searchType === "sources" ||
      searchType === "functions" ||
      searchType === "variables";

    return (
      <div key="input" className="input-wrapper">
        <SearchInput
          query={query}
          count={this.resultCount()}
          placeholder={L10N.getStr("sourceSearch.search")}
          {...(showSummary === true ? { summaryMsg } : {})}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          handleClose={this.closeModal}
        />
      </div>
    );
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

export default connect(
  state => {
    const source = getSelectedSource(state);
    let symbols = null;
    if (source != null) {
      symbols = getSymbols(state, source.toJS());
    }
    return {
      enabled: getQuickOpenEnabled(state),
      sources: formatSources(getSources(state)),
      selectedSource: getSelectedSource(state),
      symbols: formatSymbols(symbols),
      query: getQuickOpenQuery(state),
      searchType: getQuickOpenType(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(QuickOpenModal);
