/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import fuzzyAldrin from "fuzzaldrin-plus";
import { basename } from "../utils/path";
import actions from "../actions";
import {
  getSources,
  getQuickOpenEnabled,
  getQuickOpenQuery,
  getQuickOpenType,
  getSelectedSource,
  getSymbols,
  getTabs
} from "../selectors";
import { scrollList } from "../utils/result-list";
import {
  formatSymbols,
  formatSources,
  parseLineColumn,
  formatShortcutResults
} from "../utils/quick-open";
import Modal from "./shared/Modal";
import SearchInput from "./shared/SearchInput";
import ResultList from "./shared/ResultList";

import type {
  FormattedSymbolDeclarations,
  QuickOpenResult
} from "../utils/quick-open";

import type { Location } from "../types";
import type { SourceRecord } from "../reducers/sources";
import type { QuickOpenType } from "../reducers/quick-open";

import "./QuickOpenModal.css";

type Props = {
  enabled: boolean,
  sources: Array<Object>,
  selectedSource?: SourceRecord,
  query: string,
  searchType: QuickOpenType,
  symbols: FormattedSymbolDeclarations,
  tabs: string[],
  selectLocation: Location => void,
  setQuickOpenQuery: (query: string) => void,
  highlightLineRange: ({ start: number, end: number }) => void,
  closeQuickOpen: () => void,
  shortcutsModalEnabled: boolean,
  toggleShortcutsModal: () => void
};

type State = {
  results: ?Array<QuickOpenResult>,
  selectedIndex: number,
  isLoading: boolean
};

type GotoLocationType = {
  sourceId?: string,
  line: number,
  column?: number
};

function filter(values, query) {
  return fuzzyAldrin.filter(values, query, {
    key: "value",
    maxResults: 1000
  });
}

export class QuickOpenModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { results: null, selectedIndex: 0, isLoading: true };
  }

  componentDidMount() {
    const { query, shortcutsModalEnabled, toggleShortcutsModal } = this.props;

    this.updateResults(query);

    if (shortcutsModalEnabled) {
      toggleShortcutsModal();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const nowEnabled = !prevProps.enabled && this.props.enabled;
    const queryChanged = prevProps.query !== this.props.query;

    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(
        this.refs.resultList.refs,
        this.state.selectedIndex,
        nowEnabled || !queryChanged
      );
    }

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
      return this.setstate({ results, isLoading: false });
    }
    if (this.isGotoSourceQuery()) {
      const [baseQuery] = query.split(":");
      const results = filter(this.props.sources, baseQuery);
      this.setstate({ results, isLoading: false });
    } else {
      const results = filter(this.props.sources, query);
      this.setstate({ results, isLoading: false });
    }
  };

  searchSymbols = (query: string) => {
    const { symbols: { functions, variables } } = this.props;

    let results = functions;
    if (this.isVariableQuery()) {
      results = variables;
    }
    if (query === "@" || query === "#") {
      return this.setstate({ results, isLoading: false });
    }

    this.setState({
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      results: filter(results, query.slice(1))
=======
      results: filter(results, query.slice(1)),
      isLoading: false
>>>>>>> clean up
=======
      results: filter(results, query.slice(1))
>>>>>>> move loading logic into updateResults
=======
      results: filter(results, query.slice(1)), isLoading: false
>>>>>>> consolidate isLoading into setState when reuslts set
=======
      results: filter(results, query.slice(1))
>>>>>>> re isLoading, and use symbols instead
=======
      results: filter(results, query.slice(1)),
      isLoading: false
>>>>>>> clean up
=======
      results: filter(results, query.slice(1))
>>>>>>> move loading logic into updateResults
=======
      results: filter(results, query.slice(1)), isLoading: false
>>>>>>> consolidate isLoading into setState when reuslts set
=======
      results: filter(results, query.slice(1))
>>>>>>> re isLoading, and use symbols instead
    });
  };

  searchShortcuts = (query: string) => {
    const results = formatShortcutResults();
    if (query == "?") {
      this.setstate({ results, isLoading: false });
    } else {
      this.setState({
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        results: filter(results, query.slice(1))
=======
        results: filter(results, query.slice(1)),
        isLoading: false
>>>>>>> add newline at eof
=======
        results: filter(results, query.slice(1))
>>>>>>> move loading logic into updateResults
=======
        results: filter(results, query.slice(1)), isLoading: false
>>>>>>> consolidate isLoading into setState when reuslts set
=======
        results: filter(results, query.slice(1))
>>>>>>> re isLoading, and use symbols instead
=======
        results: filter(results, query.slice(1))
>>>>>>> add newline at eof
=======
        results: filter(results, query.slice(1)),
        isLoading: false
>>>>>>> add newline at eof
<<<<<<< HEAD
=======
        results: filter(results, query.slice(1))
>>>>>>> move loading logic into updateResults
=======
        results: filter(results, query.slice(1)), isLoading: false
>>>>>>> consolidate isLoading into setState when reuslts set
=======
        results: filter(results, query.slice(1))
>>>>>>> re isLoading, and use symbols instead
=======
>>>>>>> add newline at eof
      });
    }
  };

  showTopSources = () => {
    const { tabs, sources } = this.props;
    if (tabs.length > 0) {
      this.setState({
        results: sources.filter(source => tabs.includes(source.url)),
        isLoading: false
      });
    } else {
      this.setState({ results: sources.slice(0, 100), isLoading: false });
    }
  };

  updateResults = (query: string) => {
    if (this.isGotoQuery()) {
      this.setState({ isLoading: false });
      return;
    }

    if (query == "") {
      return this.showTopSources();
    }

    if (this.isSymbolSearch()) {
      return this.searchSymbols(query);
    }

    if (this.isShortcutQuery()) {
      return this.searchShortcuts(query);
    }

    this.searchSources(query);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
    return this.setState({ isLoading: false });
>>>>>>> move loading logic into updateResults
=======
>>>>>>> consolidate isLoading into setState when reuslts set
=======
    return this.setState({ isLoading: false });
>>>>>>> move loading logic into updateResults
=======
>>>>>>> consolidate isLoading into setState when reuslts set
  };

  setModifier = (item: QuickOpenResult) => {
    if (["@", "#", ":"].includes(item.id)) {
      this.props.setQuickOpenQuery(item.id);
    }
  };

  selectResultItem = (
    e: SyntheticEvent<HTMLElement>,
    item: ?QuickOpenResult
  ) => {
    if (item == null) {
      return;
    }

    if (this.isShortcutQuery()) {
      return this.setModifier(item);
    }

    if (this.isGotoSourceQuery()) {
      const location = parseLineColumn(this.props.query);
      return this.gotoLocation({ ...location, sourceId: item.id });
    }

    if (this.isSymbolSearch()) {
      return this.gotoLocation({
        line:
          item.location && item.location.start ? item.location.start.line : 0
      });
    }

    this.gotoLocation({ sourceId: item.id, line: 0 });
  };

  onSelectResultItem = (item: QuickOpenResult) => {
    const { selectLocation, selectedSource, highlightLineRange } = this.props;
    if (!this.isSymbolSearch() || selectedSource == null) {
      return;
    }

    if (this.isVariableQuery()) {
      const line =
        item.location && item.location.start ? item.location.start.line : 0;
      return selectLocation({
        sourceId: selectedSource.get("id"),
        line,
        column: null
      });
    }

    if (this.isFunctionQuery()) {
      return highlightLineRange({
        ...(item.location != null
          ? { start: item.location.start.line, end: item.location.end.line }
          : {}),
        sourceId: selectedSource.get("id")
      });
    }
  };

  traverseResults = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    const direction = e.key === "ArrowUp" ? -1 : 1;
    const { selectedIndex, results } = this.state;
    const resultCount = this.getResultCount();
    const index = selectedIndex + direction;
    const nextIndex = (index + resultCount) % resultCount;

    this.setState({ selectedIndex: nextIndex });

    if (results != null) {
      this.onSelectResultItem(results[nextIndex]);
    }
  };

  gotoLocation = (location: ?GotoLocationType) => {
    const { selectLocation, selectedSource } = this.props;
    const selectedSourceId = selectedSource ? selectedSource.get("id") : "";
    if (location != null) {
      const sourceId = location.sourceId ? location.sourceId : selectedSourceId;
      selectLocation({
        sourceId,
        line: location.line,
        column: location.column || null
      });
      this.closeModal();
    }
  };

  onChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ isLoading: true });

    const { selectedSource, setQuickOpenQuery } = this.props;
    setQuickOpenQuery(e.target.value);
    const noSource = !selectedSource || !selectedSource.get("text");
    if ((this.isSymbolSearch() && noSource) || this.isGotoQuery()) {
      return;
    }
    this.updateResults(e.target.value);
  };

  onKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    const { enabled, query } = this.props;
    const { results, selectedIndex } = this.state;

    if (!this.isGotoQuery() && (!enabled || !results)) {
      return;
    }

    if (e.key === "Enter") {
      if (this.isGotoQuery()) {
        const location = parseLineColumn(query);
        return this.gotoLocation(location);
      }

      if (results) {
        if (this.isShortcutQuery()) {
          return this.setModifier(results[selectedIndex]);
        }

        return this.selectResultItem(e, results[selectedIndex]);
      }
    }

    if (e.key === "Tab") {
      return this.closeModal();
    }

    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      return this.traverseResults(e);
    }
  };

  getResultCount = () => {
    const results = this.state.results;
    return results && results.length ? results.length : 0;
  };

  // Query helpers
  isFunctionQuery = () => this.props.searchType === "functions";
  isVariableQuery = () => this.props.searchType === "variables";
  isSymbolSearch = () => this.isFunctionQuery() || this.isVariableQuery();
  isGotoQuery = () => this.props.searchType === "goto";
  isGotoSourceQuery = () => this.props.searchType === "gotoSource";
  isShortcutQuery = () => this.props.searchType === "shortcuts";
  isSourcesQuery = () => this.props.searchType === "sources";
  isSourceSearch = () => this.isSourcesQuery() || this.isGotoSourceQuery();

  /* eslint-disable react/no-danger */
  renderHighlight = (candidateString: string, query: string, name: string) => {
    const html = fuzzyAldrin.wrap(candidateString, query);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  highlightMatching = (query: string, results: QuickOpenResult[]) => {
    let newQuery = query;
    if (newQuery === "") {
      return results;
    }
    newQuery = query.replace(/[@:#?]/gi, " ");

    return results.map(result => {
      return {
        ...result,
        title: this.renderHighlight(result.title, basename(newQuery), "title"),
        ...(result.subtitle != null && !this.isSymbolSearch()
          ? {
              subtitle: this.renderHighlight(
                result.subtitle,
                newQuery,
                "subtitle"
              )
            }
          : null)
      };
    });
  };

  shouldShowErrorEmoji() {
    const { query } = this.props;
    if (this.isGotoQuery()) {
      return !/^:\d*$/.test(query);
    }
    return !this.getResultCount() && !!query;
  }

  hasPrefix = () => /^[:#@]/.test(this.props.query);

  render() {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    const { enabled, query, symbols } = this.props;
    const { selectedIndex, results } = this.state;
=======
    const { enabled, query } = this.props;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    const { selectedIndex, results, isLoading } = this.state;
=======
    const { enabled, query, symbols } = this.props;
    const { selectedIndex, results } = this.state;
>>>>>>> re isLoading, and use symbols instead
=======
    let { selectedIndex, results } = this.state;
    const { isLoading } = this.state;
=======
    let { selectedIndex, results, isLoading } = this.state;
>>>>>>> add newline at eof
=======
    const { selectedIndex, results, isLoading } = this.state;
>>>>>>> consolidate isLoading into setState when reuslts set

    if (isLoading) {
=======
    const { enabled, query, symbols } = this.props;
    const { selectedIndex, results } = this.state;
=======
    const { enabled, query } = this.props;
    let { selectedIndex, results, isLoading } = this.state;

    if (isLoading) {
<<<<<<< HEAD
      console.log(results);
>>>>>>> wrapper for loading indicator
=======
>>>>>>> add newline at eof
      results = null;
    }

    setTimeout(() => this.setState({ isLoading: false }), 4000); // exists to simulate a situation that requires loading ( can remove set timeouts later )
>>>>>>> wrapper for loading indicator
<<<<<<< HEAD
=======
    const { enabled, query, symbols } = this.props;
    const { selectedIndex, results } = this.state;
>>>>>>> re isLoading, and use symbols instead

<<<<<<< HEAD
<<<<<<< HEAD
    if (isLoading) {
      results = null;
    }
=======
>>>>>>> wrapper for loading indicator

    setTimeout(() => this.setState({ isLoading: false }), 4000); // exists to simulate a situation that requires loading ( can remove set timeouts later )
>>>>>>> wrapper for loading indicator

=======
>>>>>>> clean up
=======
>>>>>>> clean up
    if (!enabled) {
      return null;
    }

    const summaryMsg = L10N.getFormatStr(
      "sourceSearch.resultsSummary1",
      this.getResultCount()
    );
    const showSummary =
      this.isSourcesQuery() || this.isSymbolSearch() || this.isShortcutQuery();
    const newResults = results && results.slice(0, 100);
    const items = this.highlightMatching(query, newResults || []);
    const expanded = !!items && items.length > 0;
    return (
      <Modal in={enabled} handleClose={this.closeModal}>
        <SearchInput
          query={query}
          count={this.getResultCount()}
          placeholder={L10N.getStr("sourceSearch.search")}
          {...(showSummary === true ? { summaryMsg } : {})}
          showErrorEmoji={this.shouldShowErrorEmoji()}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          handleClose={this.closeModal}
          hasPrefix={this.hasPrefix()}
          expanded={expanded}
          selectedItemId={expanded ? items[selectedIndex].id : ""}
        />
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> re isLoading, and use symbols instead
=======
>>>>>>> re isLoading, and use symbols instead
=======
>>>>>>> wrapper for loading indicator
=======
>>>>>>> add newline at eof
        {!symbols ||
          (symbols.functions.length == 0 && (
            <div className="loading-indicator">
              {L10N.getStr("loadingText")}
            </div>
          ))}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> add newline at eof
=======
        {this.state.isLoading && (
          <div className="load">{L10N.getStr("loadingText")}</div>
        )}
>>>>>>> add newline at eof
<<<<<<< HEAD
=======
        {/* {!this.state.isLoading && ( */}
=======
>>>>>>> remove comment
        {isLoading && <div className="load">{L10N.getStr("loadingText")}</div>}
>>>>>>> move loading logic into updateResults
=======
        {isLoading && (
          <div className="loading-indicator">{L10N.getStr("loadingText")}</div>
        )}
>>>>>>> pad top/bot, and center
=======
>>>>>>> re isLoading, and use symbols instead
=======
        {this.state.isLoading && (
          <div className="load">{L10N.getStr("loadingText")}</div>
        )}
>>>>>>> add newline at eof
=======
        {/* {!this.state.isLoading && ( */}
=======
>>>>>>> remove comment
        {isLoading && <div className="load">{L10N.getStr("loadingText")}</div>}
>>>>>>> move loading logic into updateResults
=======
        {isLoading && (
          <div className="loading-indicator">{L10N.getStr("loadingText")}</div>
        )}
>>>>>>> pad top/bot, and center
=======
>>>>>>> re isLoading, and use symbols instead
=======
>>>>>>> add newline at eof
        {newResults && (
          <ResultList
            key="results"
            items={items}
            selected={selectedIndex}
            selectItem={this.selectResultItem}
            ref="resultList"
            expanded={expanded}
            {...(this.isSourceSearch() ? { size: "big" } : {})}
          />
        )}
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> add newline at eof
=======
=======
>>>>>>> wrapper for loading indicator
=======
=======
>>>>>>> wrapper for loading indicator
        <div className="loading-wrapper">
          {newResults && (
            <ResultList
              key="results"
              items={items}
              selected={selectedIndex}
              selectItem={this.selectResultItem}
              ref="resultList"
              expanded={expanded}
              {...(this.isSourceSearch() ? { size: "big" } : {})}
            />
          )}
        </div>
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> wrapper for loading indicator
=======
>>>>>>> add newline at eof
=======
>>>>>>> wrapper for loading indicator
=======
>>>>>>> add newline at eof
=======
>>>>>>> wrapper for loading indicator
>>>>>>> wrapper for loading indicator
=======
>>>>>>> add newline at eof
      </Modal>
    );
  }
}

/* istanbul ignore next: ignoring testing of redux connection stuff */
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
    searchType: getQuickOpenType(state),
    tabs: getTabs(state).toArray()
  };
}

/* istanbul ignore next: ignoring testing of redux connection stuff */
export default connect(mapStateToProps, actions)(QuickOpenModal);
