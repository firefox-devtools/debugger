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
  getRelativeSources,
  getQuickOpenEnabled,
  getQuickOpenQuery,
  getQuickOpenType,
  getSelectedSource,
  getSymbols,
  getTabs,
  isSymbolsLoading
} from "../selectors";
import { scrollList } from "../utils/result-list";
import {
  formatSymbols,
  parseLineColumn,
  formatShortcutResults,
  formatSources
} from "../utils/quick-open";
import Modal from "./shared/Modal";
import SearchInput from "./shared/SearchInput";
import ResultList from "./shared/ResultList";

import type {
  FormattedSymbolDeclarations,
  QuickOpenResult
} from "../utils/quick-open";

import type { SourceLocation, Source } from "../types";
import type { QuickOpenType } from "../reducers/quick-open";
import type { Tab } from "../reducers/tabs";

import "./QuickOpenModal.css";

type Props = {
  enabled: boolean,
  sources: Array<Object>,
  selectedSource?: Source,
  query: string,
  searchType: QuickOpenType,
  symbols: FormattedSymbolDeclarations,
  symbolsLoading: boolean,
  tabs: Tab[],
  shortcutsModalEnabled: boolean,
  selectSpecificLocation: SourceLocation => void,
  setQuickOpenQuery: (query: string) => void,
  highlightLineRange: ({ start: number, end: number }) => void,
  closeQuickOpen: () => void,
  toggleShortcutsModal: () => void
};

type State = {
  results: ?Array<QuickOpenResult>,
  selectedIndex: number
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
    this.state = { results: null, selectedIndex: 0 };
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

  dropGoto = (query: string) => {
    return query.split(":")[0];
  };

  searchSources = (query: string) => {
    const { sources } = this.props;
    const results =
      query == "" ? sources : filter(sources, this.dropGoto(query));
    return this.setState({ results });
  };

  searchSymbols = (query: string) => {
    const {
      symbols: { functions, identifiers }
    } = this.props;

    let results = functions;
    if (this.isVariableQuery()) {
      results = identifiers;
    } else {
      results = results.filter(result => result.title !== "anonymous");
    }

    if (query === "@" || query === "#") {
      return this.setState({ results });
    }

    this.setState({ results: filter(results, query.slice(1)) });
  };

  searchShortcuts = (query: string) => {
    const results = formatShortcutResults();
    if (query == "?") {
      this.setState({ results });
    } else {
      this.setState({ results: filter(results, query.slice(1)) });
    }
  };

  showTopSources = () => {
    const { tabs, sources } = this.props;
    if (tabs.length > 0) {
      const tabUrls = tabs.map((tab: Tab) => tab.url);

      this.setState({
        results: sources.filter(source => tabUrls.includes(source.url))
      });
    } else {
      this.setState({ results: sources.slice(0, 100) });
    }
  };

  updateResults = (query: string) => {
    if (this.isGotoQuery()) {
      return;
    }

    if (query == "" && !this.isShortcutQuery()) {
      return this.showTopSources();
    }

    if (this.isSymbolSearch()) {
      return this.searchSymbols(query);
    }

    if (this.isShortcutQuery()) {
      return this.searchShortcuts(query);
    }

    return this.searchSources(query);
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
    const {
      selectSpecificLocation,
      selectedSource,
      highlightLineRange
    } = this.props;
    if (!this.isSymbolSearch() || selectedSource == null) {
      return;
    }

    if (this.isVariableQuery()) {
      const line =
        item.location && item.location.start ? item.location.start.line : 0;
      return selectSpecificLocation({
        sourceId: selectedSource.id,
        line
      });
    }

    if (this.isFunctionQuery()) {
      return highlightLineRange({
        ...(item.location != null
          ? { start: item.location.start.line, end: item.location.end.line }
          : {}),
        sourceId: selectedSource.id
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
    const { selectSpecificLocation, selectedSource } = this.props;
    const selectedSourceId = selectedSource ? selectedSource.id : "";
    if (location != null) {
      const sourceId = location.sourceId ? location.sourceId : selectedSourceId;
      selectSpecificLocation({
        sourceId,
        line: location.line,
        column: location.column
      });
      this.closeModal();
    }
  };

  onChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { selectedSource, setQuickOpenQuery } = this.props;
    setQuickOpenQuery(e.target.value);
    const noSource = !selectedSource || !selectedSource.text;
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
        return this.selectResultItem(e, results[selectedIndex]);
      }
    }

    if (e.key === "Tab") {
      return this.closeModal();
    }

    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
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
  renderHighlight(
    candidateString: string | React$Element<"div">,
    query: string,
    name: string
  ): string | React$Element<"div"> {
    const options = {
      wrap: {
        tagOpen: '<mark class="highlight">',
        tagClose: "</mark>"
      }
    };
    const html = fuzzyAldrin.wrap(candidateString, query, options);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  highlightMatching = (
    query: string,
    results: QuickOpenResult[]
  ): QuickOpenResult[] => {
    let newQuery = query;
    if (newQuery === "") {
      return results;
    }
    newQuery = query.replace(/[@:#?]/gi, " ");

    return results.map(result => {
      if (typeof result.title == "string") {
        return {
          ...result,
          title: this.renderHighlight(result.title, basename(newQuery), "title")
        };
      }
      return result;
    });
  };

  shouldShowErrorEmoji() {
    const { query } = this.props;
    if (this.isGotoQuery()) {
      return !/^:\d*$/.test(query);
    }
    return !this.getResultCount() && !!query;
  }

  getSummaryMessage() {
    let summaryMsg = "";
    if (this.isGotoQuery()) {
      summaryMsg = L10N.getStr("shortcuts.gotoLine");
    } else if (
      (this.isFunctionQuery() || this.isVariableQuery()) &&
      this.props.symbolsLoading
    ) {
      summaryMsg = L10N.getStr("loadingText");
    }
    return summaryMsg;
  }

  render() {
    const { enabled, query } = this.props;
    const { selectedIndex, results } = this.state;

    if (!enabled) {
      return null;
    }
    const newResults = results && results.slice(0, 100);
    const items = this.highlightMatching(query, newResults || []);
    const expanded = !!items && items.length > 0;

    return (
      <Modal in={enabled} handleClose={this.closeModal}>
        <SearchInput
          query={query}
          hasPrefix={true}
          count={this.getResultCount()}
          placeholder={L10N.getStr("sourceSearch.search2")}
          summaryMsg={this.getSummaryMessage()}
          showErrorEmoji={this.shouldShowErrorEmoji()}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          handleClose={this.closeModal}
          expanded={expanded}
          showClose={false}
          selectedItemId={
            expanded && items[selectedIndex] ? items[selectedIndex].id : ""
          }
          {...(this.isSourceSearch() ? { size: "big" } : {})}
        />
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
      </Modal>
    );
  }
}

/* istanbul ignore next: ignoring testing of redux connection stuff */
function mapStateToProps(state) {
  const selectedSource = getSelectedSource(state);

  return {
    enabled: getQuickOpenEnabled(state),
    sources: formatSources(getRelativeSources(state), getTabs(state)),
    selectedSource,
    symbols: formatSymbols(getSymbols(state, selectedSource)),
    symbolsLoading: isSymbolsLoading(state, selectedSource),
    query: getQuickOpenQuery(state),
    searchType: getQuickOpenType(state),
    tabs: getTabs(state)
  };
}

/* istanbul ignore next: ignoring testing of redux connection stuff */
export default connect(
  mapStateToProps,
  {
    shortcutsModalEnabled: actions.shortcutsModalEnabled,
    selectSpecificLocation: actions.selectSpecificLocation,
    setQuickOpenQuery: actions.setQuickOpenQuery,
    highlightLineRange: actions.highlightLineRange,
    closeQuickOpen: actions.closeQuickOpen,
    toggleShortcutsModal: actions.toggleShortcutsModal
  }
)(QuickOpenModal);
