/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import Svg from "../shared/Svg";
import actions from "../../actions";
import {
  getActiveSearch,
  getSelectedSource,
  getSelectedLocation,
  getFileSearchQuery,
  getFileSearchModifiers,
  getFileSearchResults,
  getHighlightedLineRange
} from "../../selectors";

import { removeOverlay } from "../../utils/editor";

import { scrollList } from "../../utils/result-list";
import classnames from "classnames";

import type { Source } from "../../types";
import type { ActiveSearchType } from "../../reducers/ui";
import type { Modifiers, SearchResults } from "../../reducers/file-search";

import SearchInput from "../shared/SearchInput";
import { debounce } from "lodash";
import "./SearchBar.css";

import type SourceEditor from "../../utils/editor/source-editor";

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

type State = {
  query: string,
  selectedResultIndex: number,
  count: number,
  index: number,
  inputFocused: boolean
};

type Props = {
  editor?: SourceEditor,
  selectedSource?: Source,
  searchOn: boolean,
  searchResults: SearchResults,
  modifiers: Modifiers,
  query: string,
  toggleFileSearchModifier: string => any,
  setFileSearchQuery: string => any,
  setActiveSearch: (?ActiveSearchType) => any,
  closeFileSearch: SourceEditor => void,
  doSearch: (string, SourceEditor) => void,
  traverseResults: (boolean, SourceEditor) => void,
  updateSearchResults: ({ count: number, index?: number }) => any
};

class SearchBar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      query: props.query,
      selectedResultIndex: 0,
      count: 0,
      index: -1,
      inputFocused: false
    };
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
    // overwrite this.doSearch with debounced version to
    // reduce frequency of queries
    this.doSearch = debounce(this.doSearch, 100);
    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut,
      searchAgainShortcut,
      shiftSearchAgainShortcut
    } = getShortcuts();

    shortcuts.on(searchShortcut, (_, e) => this.toggleSearch(e));
    shortcuts.on("Escape", (_, e) => this.onEscape(e));

    shortcuts.on(shiftSearchAgainShortcut, (_, e) =>
      this.traverseResults(e, true)
    );

    shortcuts.on(searchAgainShortcut, (_, e) => this.traverseResults(e, false));
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }
  }

  onEscape = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    this.closeSearch(e);
  };

  clearSearch = () => {
    const { editor: ed, query } = this.props;
    if (ed) {
      const ctx = { ed, cm: ed.codeMirror };
      removeOverlay(ctx, query);
    }
  };

  closeSearch = (e: SyntheticEvent<HTMLElement>) => {
    const { closeFileSearch, editor, searchOn } = this.props;
    if (editor && searchOn) {
      this.clearSearch();
      closeFileSearch(editor);
      e.stopPropagation();
      e.preventDefault();
    }
    this.setState({ query: "", inputFocused: false });
  };

  toggleSearch = (e: SyntheticKeyboardEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const { editor, searchOn, setActiveSearch } = this.props;

    if (!searchOn) {
      setActiveSearch("file");
    }

    if (searchOn && editor) {
      const query = editor.codeMirror.getSelection() || this.state.query;

      if (query !== "") {
        this.setState({ query, inputFocused: true });
        this.doSearch(query);
      } else {
        this.setState({ query: "", inputFocused: true });
      }
    }
  };

  doSearch = (query: string) => {
    const { selectedSource } = this.props;
    if (!selectedSource || !selectedSource.text) {
      return;
    }

    this.props.doSearch(query, this.props.editor);
  };

  updateSearchResults = (characterIndex, line, matches) => {
    const matchIndex = matches.findIndex(
      elm => elm.line === line && elm.ch === characterIndex
    );
    this.props.updateSearchResults({
      matches,
      matchIndex,
      count: matches.length,
      index: characterIndex
    });
  };

  traverseResults = (e: SyntheticEvent<HTMLElement>, rev: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    const editor = this.props.editor;

    if (!editor) {
      return;
    }
    this.props.traverseResults(rev, editor);
  };

  // Handlers

  onChange = (e: SyntheticInputEvent<HTMLElement>) => {
    this.setState({ query: e.target.value });

    return this.doSearch(e.target.value);
  };

  onBlur = (e: SyntheticFocusEvent<HTMLElement>) => {
    this.setState({ inputFocused: false });
  };

  onKeyDown = (e: any) => {
    if (e.key !== "Enter" && e.key !== "F3") {
      return;
    }

    this.traverseResults(e, e.shiftKey);
    e.preventDefault();
    return this.doSearch(e.target.value);
  };

  // Renderers
  buildSummaryMsg() {
    const {
      searchResults: { matchIndex, count, index },
      query
    } = this.props;

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

  renderSearchModifiers = () => {
    const { modifiers, toggleFileSearchModifier, query } = this.props;
    const { doSearch } = this;

    function SearchModBtn({ modVal, className, svgName, tooltip }) {
      const preppedClass = classnames(className, {
        active: modifiers && modifiers.get(modVal)
      });
      return (
        <button
          className={preppedClass}
          onClick={() => {
            toggleFileSearchModifier(modVal);
            doSearch(query);
          }}
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
  };

  shouldShowErrorEmoji() {
    const {
      query,
      searchResults: { count }
    } = this.props;
    return !!query && !count;
  }

  render() {
    const {
      searchResults: { count },
      searchOn
    } = this.props;

    if (!searchOn) {
      return <div />;
    }
    return (
      <div className="search-bar">
        <SearchInput
          query={this.state.query}
          count={count}
          placeholder={L10N.getStr("sourceSearch.search.placeholder")}
          summaryMsg={this.buildSummaryMsg()}
          onChange={this.onChange}
          onBlur={this.onBlur}
          showErrorEmoji={this.shouldShowErrorEmoji()}
          onKeyDown={this.onKeyDown}
          handleNext={e => this.traverseResults(e, false)}
          handlePrev={e => this.traverseResults(e, true)}
          handleClose={this.closeSearch}
          shouldFocus={this.state.inputFocused}
        />
        <div className="search-bottom-bar">{this.renderSearchModifiers()}</div>
      </div>
    );
  }
}

SearchBar.contextTypes = {
  shortcuts: PropTypes.object
};

const mapStateToProps = state => ({
  searchOn: getActiveSearch(state) === "file",
  selectedSource: getSelectedSource(state),
  selectedLocation: getSelectedLocation(state),
  query: getFileSearchQuery(state),
  modifiers: getFileSearchModifiers(state),
  highlightedLineRange: getHighlightedLineRange(state),
  searchResults: getFileSearchResults(state)
});

export default connect(
  mapStateToProps,
  {
    toggleFileSearchModifier: actions.toggleFileSearchModifier,
    setFileSearchQuery: actions.setFileSearchQuery,
    setActiveSearch: actions.setActiveSearch,
    closeFileSearch: actions.closeFileSearch,
    doSearch: actions.doSearch,
    traverseResults: actions.traverseResults,
    updateSearchResults: actions.updateSearchResults
  }
)(SearchBar);
