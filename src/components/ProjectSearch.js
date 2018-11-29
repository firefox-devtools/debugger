/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import actions from "../actions";

import { getEditor } from "../utils/editor";
import { highlightMatches } from "../utils/project-search";

import { statusType } from "../reducers/project-text-search";
import { getRelativePath } from "../utils/sources-tree";
import {
  getSources,
  getActiveSearch,
  getTextSearchResults,
  getTextSearchStatus,
  getTextSearchQuery
} from "../selectors";

import Svg from "./shared/Svg";
import ManagedTree from "./shared/ManagedTree";
import SearchInput from "./shared/SearchInput";

import type { List } from "immutable";
import type { SourceLocation } from "../types";
import type { ActiveSearchType } from "../reducers/types";
import type { StatusType } from "../reducers/project-text-search";
type Editor = ?Object;

import "./ProjectSearch.css";

export type Match = {
  type: "MATCH",
  sourceId: string,
  line: number,
  column: number,
  match: string,
  value: string,
  text: string
};

type Result = {
  type: "RESULT",
  filepath: string,
  matches: Array<Match>,
  sourceId: string
};

type Item = Result | Match;

type State = {
  inputValue: string,
  inputFocused: boolean
};

type Props = {
  sources: Object,
  query: string,
  results: List<Result>,
  status: StatusType,
  activeSearch: ActiveSearchType,
  closeProjectSearch: () => void,
  searchSources: (query: string) => void,
  clearSearch: () => void,
  selectSpecificLocation: (location: SourceLocation, tabIndex?: string) => void,
  setActiveSearch: (activeSearch?: ActiveSearchType) => void,
  doSearchForHighlight: (
    query: string,
    editor: Editor,
    line: number,
    column: number
  ) => void
};

function getFilePath(item: Item, index?: number) {
  return item.type === "RESULT"
    ? `${item.sourceId}-${index || "$"}`
    : `${item.sourceId}-${item.line}-${item.column}-${index || "$"}`;
}

function sanitizeQuery(query: string): string {
  // no '\' at end of query
  return query.replace(/\\$/, "");
}

export class ProjectSearch extends Component<Props, State> {
  focusedItem: ?{
    setExpanded?: any,
    file?: any,
    expanded?: any,
    match?: Match
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      inputValue: this.props.query || "",
      inputFocused: false
    };
  }

  componentDidMount() {
    const { shortcuts } = this.context;

    shortcuts.on(
      L10N.getStr("projectTextSearch.key"),
      this.toggleProjectTextSearch
    );
    shortcuts.on("Enter", this.onEnterPress);
  }

  componentWillUnmount() {
    const { shortcuts } = this.context;
    shortcuts.off(
      L10N.getStr("projectTextSearch.key"),
      this.toggleProjectTextSearch
    );
    shortcuts.off("Enter", this.onEnterPress);
  }

  componentDidUpdate(prevProps: Props) {
    // If the query changes in redux, also change it in the UI
    if (prevProps.query !== this.props.query) {
      this.setState({ inputValue: this.props.query });
    }
  }

  doSearch(searchTerm: string) {
    this.props.searchSources(searchTerm);
  }

  toggleProjectTextSearch = (key: string, e: KeyboardEvent) => {
    const { closeProjectSearch, setActiveSearch } = this.props;
    if (e) {
      e.preventDefault();
    }

    if (this.isProjectSearchEnabled()) {
      return closeProjectSearch();
    }

    return setActiveSearch("project");
  };

  isProjectSearchEnabled = () => this.props.activeSearch === "project";

  selectMatchItem = (matchItem: Match) => {
    this.props.selectSpecificLocation({
      sourceId: matchItem.sourceId,
      line: matchItem.line,
      column: matchItem.column
    });
    this.props.doSearchForHighlight(
      this.state.inputValue,
      getEditor(),
      matchItem.line,
      matchItem.column
    );
  };

  getResults = (): Result[] => {
    const { results } = this.props;
    return results
      .toJS()
      .map(result => ({
        type: "RESULT",
        ...result,
        matches: result.matches.map(m => ({ type: "MATCH", ...m }))
      }))
      .filter(result => result.filepath && result.matches.length > 0);
  };

  getResultCount = () =>
    this.getResults().reduce((count, file) => count + file.matches.length, 0);

  onKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      return;
    }

    e.stopPropagation();

    if (e.key !== "Enter") {
      return;
    }
    this.focusedItem = null;
    const query = sanitizeQuery(this.state.inputValue);
    if (query) {
      this.doSearch(query);
    }
  };

  onHistoryScroll = (query: string) => {
    this.setState({ inputValue: query });
  };

  onEnterPress = () => {
    if (this.focusedItem && !this.state.inputFocused) {
      const { setExpanded, file, expanded, match } = this.focusedItem;
      if (setExpanded) {
        setExpanded(file, !expanded);
      } else if (match) {
        this.selectMatchItem(match);
      }
    }
  };

  inputOnChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const { clearSearch } = this.props;
    this.setState({ inputValue });
    if (inputValue === "") {
      clearSearch();
    }
  };

  renderFile = (
    file: Result,
    focused: boolean,
    expanded: boolean,
    setExpanded: Function
  ) => {
    if (focused) {
      this.focusedItem = { setExpanded, file, expanded };
    }

    const matchesLength = file.matches.length;
    const matches = ` (${matchesLength} match${matchesLength > 1 ? "es" : ""})`;

    return (
      <div
        className={classnames("file-result", { focused })}
        key={file.sourceId}
      >
        <Svg name="arrow" className={classnames({ expanded })} />
        <img className="file" />
        <span className="file-path">{getRelativePath(file.filepath)}</span>
        <span className="matches-summary">{matches}</span>
      </div>
    );
  };

  renderMatch = (match: Match, focused: boolean) => {
    if (focused) {
      this.focusedItem = { match };
    }
    return (
      <div
        className={classnames("result", { focused })}
        onClick={() => setTimeout(() => this.selectMatchItem(match), 50)}
      >
        <span className="line-number" key={match.line}>
          {match.line}
        </span>
        {highlightMatches(match)}
      </div>
    );
  };

  renderItem = (
    item: Item,
    depth: number,
    focused: boolean,
    _: any,
    expanded: boolean,
    { setExpanded }: { setExpanded: Function }
  ) => {
    if (item.type === "RESULT") {
      return this.renderFile(item, focused, expanded, setExpanded);
    }
    return this.renderMatch(item, focused);
  };

  renderResults = () => {
    const results = this.getResults();
    const { status } = this.props;
    if (!this.props.query) {
      return;
    }
    if (results.length && status === statusType.done) {
      return (
        <ManagedTree
          getRoots={() => results}
          getChildren={file => file.matches || []}
          itemHeight={24}
          autoExpandAll={true}
          autoExpandDepth={1}
          getParent={item => null}
          getPath={getFilePath}
          renderItem={this.renderItem}
        />
      );
    }
    const msg =
      status === statusType.fetching
        ? L10N.getStr("loadingText")
        : L10N.getStr("projectTextSearch.noResults");
    return <div className="no-result-msg absolute-center">{msg}</div>;
  };

  renderSummary = () => {
    return this.props.query !== ""
      ? L10N.getFormatStr("sourceSearch.resultsSummary1", this.getResultCount())
      : "";
  };

  shouldShowErrorEmoji() {
    return !this.getResultCount() && this.props.status === statusType.done;
  }

  renderInput() {
    return (
      <SearchInput
        query={this.state.inputValue}
        count={this.getResultCount()}
        placeholder={L10N.getStr("projectTextSearch.placeholder")}
        size="big"
        showErrorEmoji={this.shouldShowErrorEmoji()}
        summaryMsg={this.renderSummary()}
        onChange={this.inputOnChange}
        onFocus={() => this.setState({ inputFocused: true })}
        onBlur={() => this.setState({ inputFocused: false })}
        onKeyDown={this.onKeyDown}
        onHistoryScroll={this.onHistoryScroll}
        handleClose={this.props.closeProjectSearch}
        ref="searchInput"
      />
    );
  }

  render() {
    if (!this.isProjectSearchEnabled()) {
      return null;
    }

    return (
      <div className="search-container">
        <div className="project-text-search">
          <div className="header">{this.renderInput()}</div>
          {this.renderResults()}
        </div>
      </div>
    );
  }
}
ProjectSearch.contextTypes = {
  shortcuts: PropTypes.object
};

const mapStateToProps = state => ({
  sources: getSources(state),
  activeSearch: getActiveSearch(state),
  results: getTextSearchResults(state),
  query: getTextSearchQuery(state),
  status: getTextSearchStatus(state)
});

export default connect(
  mapStateToProps,
  {
    closeProjectSearch: actions.closeProjectSearch,
    searchSources: actions.searchSources,
    clearSearch: actions.clearSearch,
    selectSpecificLocation: actions.selectSpecificLocation,
    setActiveSearch: actions.setActiveSearch,
    doSearchForHighlight: actions.doSearchForHighlight
  }
)(ProjectSearch);
