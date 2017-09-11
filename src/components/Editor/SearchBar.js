// @flow

import React, { Component, PropTypes } from "react";
import { findDOMNode } from "react-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Svg from "../shared/Svg";
import actions from "../../actions";
import {
  getActiveSearch,
  getFileSearchQuery,
  getFileSearchModifiers,
  getSearchResults
} from "../../selectors";

import { removeOverlay } from "../../utils/editor";

import { scrollList } from "../../utils/result-list";
import classnames from "classnames";
import { debounce } from "lodash";

import { SourceEditor } from "devtools-source-editor";
import type { SourceRecord } from "../../reducers/sources";
import type { SearchResults } from "../../reducers/file-search";
import type { ActiveSearchType, FileSearchModifiers } from "../../reducers/ui";
import type { SelectSourceOptions } from "../../actions/sources";
import SearchInput from "../shared/SearchInput";
import "./SearchBar.css";

function getShortcuts() {
  const searchAgainKey = L10N.getStr("sourceSearch.search.again.key2");
  const searchAgainPrevKey = L10N.getStr("sourceSearch.search.againPrev.key2");
  const searchKey = L10N.getStr("sourceSearch.search.key2");

  return {
    shiftSearchAgainShortcut: searchAgainPrevKey,
    searchAgainShortcut: searchAgainKey,
    searchShortcut: searchKey
  };
}

type SearchBarState = {
  selectedResultIndex: number,
  count: number,
  index: number
};

type Props = {
  editor?: SourceEditor,
  selectSource: (string, ?SelectSourceOptions) => any,
  selectedSource?: SourceRecord,
  highlightLineRange: ({ start: number, end: number }) => void,
  clearHighlightLineRange: () => void,
  searchOn?: boolean,
  setActiveSearch: (?ActiveSearchType) => any,
  searchResults: SearchResults,
  modifiers: FileSearchModifiers,
  toggleFileSearchModifier: string => any,
  query: string,
  setFileSearchQuery: string => any,
  updateSearchResults: ({ count: number, index?: number }) => any
};

class SearchBar extends Component {
  state: SearchBarState;

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedResultIndex: 0,
      count: 0,
      index: -1
    };

    const self: any = this;
    self.onEscape = this.onEscape.bind(this);
    self.clearSearch = this.clearSearch.bind(this);
    self.closeSearch = this.closeSearch.bind(this);
    self.setSearchValue = this.setSearchValue.bind(this);
    self.selectSearchInput = this.selectSearchInput.bind(this);
    self.searchInput = this.searchInput.bind(this);
    self.onChange = this.onChange.bind(this);
    self.onKeyUp = this.onKeyUp.bind(this);
    self.buildSummaryMsg = this.buildSummaryMsg.bind(this);
    self.renderSearchModifiers = this.renderSearchModifiers.bind(this);
    self.onEscape = this.onEscape.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut,
      searchAgainShortcut,
      shiftSearchAgainShortcut
    } = getShortcuts();

    shortcuts.off(searchShortcut);
    shortcuts.off("Escape");
    shortcuts.off(searchAgainShortcut);
    shortcuts.off(shiftSearchAgainShortcut);
  }

  componentDidMount() {
    // overwrite searchContents with a debounced version to reduce the
    // frequency of queries which improves perf on large files
    // $FlowIgnore
    this.searchContents = debounce(this.props.searchContents, 100);

    const shortcuts = this.context.shortcuts;
    const { searchAgainShortcut, shiftSearchAgainShortcut } = getShortcuts();

    shortcuts.on("Escape", this.onEscape);

    shortcuts.on(shiftSearchAgainShortcut, (_, e) =>
      this.props.traverseResults(e, true)
    );

    shortcuts.on(searchAgainShortcut, (_, e) =>
      this.props.traverseResults(e, false)
    );
  }

  componentDidUpdate(prevProps: Props, prevState: SearchBarState) {
    const searchInput = this.searchInput();

    if (searchInput) {
      searchInput.focus();
    }

    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }
  }

  onEscape(e: SyntheticKeyboardEvent) {
    this.closeSearch(e);
  }

  onSearchAgain(e: SyntheticKeyboardEvent, rev: boolean) {
    e.stopPropagation();
    e.preventDefault();

    this.props.traverseResults(rev);
  }

  clearSearch() {
    const { editor: ed, query, modifiers } = this.props;
    if (ed && modifiers) {
      const ctx = { ed, cm: ed.codeMirror };
      removeOverlay(ctx, query, modifiers.toJS());
    }
  }

  closeSearch(e: SyntheticEvent) {
    const { editor, setFileSearchQuery, searchOn } = this.props;

    if (editor && searchOn) {
      setFileSearchQuery("");
      this.clearSearch();
      this.props.setActiveSearch();
      this.props.clearHighlightLineRange();
      e.stopPropagation();
      e.preventDefault();
    }
  }

  setSearchValue(value: string) {
    const searchInput = this.searchInput();
    if (value == "" || !searchInput) {
      return;
    }

    searchInput.value = value;
  }

  selectSearchInput() {
    const searchInput = this.searchInput();
    if (searchInput) {
      searchInput.setSelectionRange(0, searchInput.value.length);
      searchInput.focus();
    }
  }

  searchInput(): ?HTMLInputElement {
    const node = findDOMNode(this);
    if (node instanceof HTMLElement) {
      const input = node.querySelector("input");
      if (input instanceof HTMLInputElement) {
        return input;
      }
    }
    return null;
  }

  // Handlers

  onChange(e: any) {
    return this.props.doSearch(e.target.value);
  }

  onKeyUp(e: SyntheticKeyboardEvent) {
    if (e.key !== "Enter" && e.key !== "F3") {
      return;
    }

    this.props.traverseResults(e, e.shiftKey);
    e.preventDefault();
  }

  // Renderers
  buildSummaryMsg() {
    const { searchResults: { matchIndex, count, index }, query } = this.props;

    if (query.trim() == "") {
      return "";
    }

    if (count == 0) {
      return L10N.getStr("editor.noResults");
    }

    if (index == -1) {
      return L10N.getFormatStr("sourceSearch.resultsSummary1", count);
    }

    return L10N.getFormatStr("editor.searchResults", matchIndex + 1, count);
  }

  renderSearchModifiers() {
    const { modifiers, toggleFileSearchModifier } = this.props;

    function SearchModBtn({ modVal, className, svgName, tooltip }) {
      const preppedClass = classnames(className, {
        active: modifiers && modifiers.get(modVal)
      });
      return (
        <button
          className={preppedClass}
          onClick={() => toggleFileSearchModifier(modVal)}
          title={tooltip}
        >
          <Svg name={svgName} />
        </button>
      );
    }

    return (
      <div className="search-modifiers">
        <span className="search-type-name">
          {L10N.getStr("symbolSearch.searchModifier.modifiersLabel")}
        </span>
        <SearchModBtn
          modVal="regexMatch"
          className="regex-match-btn"
          svgName="regex-match"
          tooltip={L10N.getStr("symbolSearch.searchModifier.regex")}
        />
        <SearchModBtn
          modVal="caseSensitive"
          className="case-sensitive-btn"
          svgName="case-match"
          tooltip={L10N.getStr("symbolSearch.searchModifier.caseSensitive")}
        />
        <SearchModBtn
          modVal="wholeWord"
          className="whole-word-btn"
          svgName="whole-word-match"
          tooltip={L10N.getStr("symbolSearch.searchModifier.wholeWord")}
        />
      </div>
    );
  }

  renderSearchType() {
    return (
      <div className="search-type-toggles">
        <span
          className="search-type-name"
          onClick={() => this.props.setActiveSearch("symbol")}
        >
          {L10N.getStr("symbolSearch.search.functionsPlaceholder")}
        </span>
      </div>
    );
  }

  render() {
    const { searchResults: { count }, query, searchOn } = this.props;

    if (!searchOn) {
      return <div />;
    }

    return (
      <div className="search-bar">
        <SearchInput
          query={query}
          count={count}
          placeholder={L10N.getStr("sourceSearch.search.placeholder")}
          summaryMsg={this.buildSummaryMsg()}
          onChange={this.onChange}
          onKeyUp={this.onKeyUp}
          handleNext={e => this.props.traverseResults(e, false)}
          handlePrev={e => this.props.traverseResults(e, true)}
          handleClose={this.closeSearch}
        />
        <div className="search-bottom-bar">
          {this.renderSearchType()}
          {this.renderSearchModifiers()}
        </div>
      </div>
    );
  }
}

SearchBar.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => {
    return {
      searchOn: getActiveSearch(state) === "file",
      query: getFileSearchQuery(state),
      modifiers: getFileSearchModifiers(state),
      searchResults: getSearchResults(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SearchBar);
