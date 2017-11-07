/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
import {
  formatSymbols,
  formatSources,
  parseLineColumn
} from "../utils/quick-open";
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
    if (query === "@" || query === "#") {
      this.setState({ results });
      return;
    }

    results = filter(results, query.slice(1), {
      key: "value"
    });

    this.setState({ results });
  };

  updateResults = (query: string) => {
    if (this.isSymbolSearch()) {
      return this.searchSymbols(query);
    }
    return this.searchSources(query);
  };

  selectResultItem = (
    e: SyntheticEvent<HTMLElement>,
    item: ?FormattedSource | ?FormattedSymbolDeclaration
  ) => {
    if (item == null) {
      return;
    }
    const { selectSource, selectedSource, query, searchType } = this.props;
    if (this.isSymbolSearch()) {
      if (selectedSource == null) {
        return;
      }
      selectSource(selectedSource.get("id"), {
        location: {
          ...(item.location != null ? { line: item.location.start.line } : {})
        }
      });
    } else if (searchType === "gotoSource") {
      const location = parseLineColumn(query);
      if (location != null) {
        selectSource(item.id, { location });
      }
    } else {
      selectSource(item.id);
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
    if (!this.isSymbolSearch() || selectedSource == null) {
      return;
    }

    if (searchType === "variables") {
      selectSource(selectedSource.get("id"), {
        location: {
          ...(item.location != null ? { line: item.location.start.line } : {})
        }
      });
    }

    if (searchType === "functions") {
      highlightLineRange({
        ...(item.location != null
          ? { start: item.location.start.line, end: item.location.end.line }
          : {}),
        sourceId: selectedSource.get("id")
      });
    }
  };

  traverseResults = (direction: number) => {
    const { selectedIndex, results } = this.state;
    const resultCount = this.resultCount();
    const index = selectedIndex + direction;
    const nextIndex = (index + resultCount) % resultCount;

    this.setState({ selectedIndex: nextIndex });

    if (results != null) {
      this.onSelectResultItem(results[nextIndex]);
    }
  };

  onChange = (e: SyntheticInputEvent<HTMLElement>) => {
    const { selectedSource, setQuickOpenQuery } = this.props;
    setQuickOpenQuery(e.target.value);
    const noSource = !selectedSource || !selectedSource.get("text");
    if (this.isSymbolSearch() && noSource) {
      return;
    }
    this.updateResults(e.target.value);
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

    const canTraverse = searchType !== "goto";
    if (e.key === "ArrowUp" && canTraverse) {
      return this.traverseResults(-1);
    } else if (e.key === "ArrowDown" && canTraverse) {
      return this.traverseResults(1);
    } else if (e.key === "Enter") {
      if (searchType === "goto") {
        if (!selectedSource) {
          return;
        }
        const location = parseLineColumn(query);
        if (location != null) {
          selectSource(selectedSource.get("id"), { location });
        }
      } else {
        this.selectResultItem(e, results[selectedIndex]);
      }
      return this.closeModal();
    } else if (e.key === "Tab") {
      return this.closeModal();
    }
  };

  resultCount = () => (this.state.results ? this.state.results.length : 0);

  isSymbolSearch = () =>
    ["functions", "variables"].includes(this.props.searchType);

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

function mapStateToProps(state) {
  const selectedSource = getSelectedSource(state);
  let symbols = null;
  if (selectedSource != null) {
    symbols = getSymbols(state, selectedSource.toJS());
  }
  return {
    enabled: getQuickOpenEnabled(state),
    sources: formatSources(getSources(state)),
    selectedSource,
    symbols: formatSymbols(symbols),
    query: getQuickOpenQuery(state),
    searchType: getQuickOpenType(state)
  };
}

export default connect(mapStateToProps, dispatch =>
  bindActionCreators(actions, dispatch)
)(QuickOpenModal);
