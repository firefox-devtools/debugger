/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import classnames from "classnames";
import { bindActionCreators } from "redux";
import actions from "../../actions";

import { highlightMatches } from "./utils/highlight";

import { statusType } from "../../reducers/project-text-search";
import { getRelativePath } from "../../utils/sources-tree";
import {
  getSources,
  getActiveSearch,
  getTextSearchResults,
  getTextSearchStatus,
  getTextSearchQuery
} from "../../selectors";

import Svg from "../shared/Svg";
import ManagedTree from "../shared/ManagedTree";
import SearchInput from "../shared/SearchInput";

import type { List } from "immutable";
import type { Location } from "../../types";
import type { ActiveSearchType } from "../../reducers/types";
import type { StatusType } from "../../reducers/project-text-search";

import "./ProjectSearch.css";

type Match = {
  sourceId: string,
  line: number,
  column: number,
  match: string,
  value: string,
  text: string
};
type Result = {
  filepath: string,
  matches: Array<Match>,
  sourceId: string
};

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
  setActiveSearch: (activeSearch?: ActiveSearchType) => void,
  closeProjectSearch: () => void,
  searchSources: (query: string) => void,
  selectLocation: (location: Location, tabIndex?: string) => void
};

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
    this.props.selectLocation({ ...matchItem });
  };

  getResults = (): Result[] => {
    const { results } = this.props;
    return results
      .toJS()
      .filter(result => result.filepath && result.matches.length > 0);
  };

  getResultCount = () => {
    const results = this.getResults();
    return results.reduce(
      (count, file) => count + (file.matches ? file.matches.length : 0),
      0
    );
  };

  onKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      return;
    }

    e.stopPropagation();

    if (e.key !== "Enter") {
      return;
    }
    this.focusedItem = null;
    this.props.searchSources(this.state.inputValue);
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
    this.setState({ inputValue });
  };

  renderFile(
    file: Result,
    focused: boolean,
    expanded: boolean,
    setExpanded: Function
  ) {
    if (focused) {
      this.focusedItem = { setExpanded, file, expanded };
    }

    const matchesLength = file.matches.length;
    const matches = ` (${matchesLength} match${matchesLength > 1 ? "es" : ""})`;

    return (
      <div
        className={classnames("file-result", { focused })}
        key={file.sourceId}
        onClick={e => setExpanded(file, !expanded)}
      >
        <Svg name="arrow" className={classnames({ expanded })} />
        <img className="file" />
        <span className="file-path">{getRelativePath(file.filepath)}</span>
        <span className="matches-summary">{matches}</span>
      </div>
    );
  }

  renderMatch(match: Match, focused: boolean) {
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
        {this.renderMatchValue(match)}
      </div>
    );
  }

  renderMatchValue(lineMatch: Match) {
    return highlightMatches(lineMatch);
  }

  renderResults() {
    const results = this.getResults().filter(
      result => result.matches.length > 0
    );

    const { status } = this.props;

    function getFilePath(item: Match, index?: number) {
      return item.filepath
        ? `${item.sourceId}-${index || "$"}`
        : `${item.sourceId}-${item.line}-${item.column}-${index || "$"}`;
    }

    const renderItem = (item, depth, focused, _, expanded, { setExpanded }) => {
      return item.filepath
        ? this.renderFile(item, focused, expanded, setExpanded)
        : this.renderMatch(item, focused);
    };
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
          renderItem={renderItem}
        />
      );
    } else if (
      (this.props.query && !results.length) ||
      status === statusType.fetching
    ) {
      return (
        <div className="no-result-msg absolute-center">
          {L10N.getStr("projectTextSearch.noResults")}
        </div>
      );
    }
  }

  renderInput() {
    const resultCount = this.getResultCount();

    return (
      <SearchInput
        query={this.state.inputValue}
        count={resultCount}
        placeholder={L10N.getStr("projectTextSearch.placeholder")}
        size="big"
        summaryMsg={
          this.props.query !== ""
            ? L10N.getFormatStr("sourceSearch.resultsSummary1", resultCount)
            : ""
        }
        onChange={e => this.inputOnChange(e)}
        onFocus={() => this.setState({ inputFocused: true })}
        onBlur={() => this.setState({ inputFocused: false })}
        onKeyDown={e => this.onKeyDown(e)}
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

export default connect(
  state => ({
    sources: getSources(state),
    activeSearch: getActiveSearch(state),
    results: getTextSearchResults(state),
    query: getTextSearchQuery(state),
    status: getTextSearchStatus(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(ProjectSearch);
