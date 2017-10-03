// @flow

import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Svg from "../shared/Svg";
import actions from "../../actions";
import {
  getActiveSearch,
  getFileSearchQuery,
  getFileSearchModifiers,
  getFileSearchResults
} from "../../selectors";

import { scrollList } from "../../utils/result-list";
import classnames from "classnames";

import { SourceEditor } from "devtools-source-editor";
import type { SourceRecord } from "../../reducers/sources";
import type { SearchResults } from "../../reducers/file-search";
import type { ActiveSearchType, FileSearchModifiers } from "../../reducers/ui";
import type { SelectSourceOptions } from "../../actions/sources";
import SearchInput from "../shared/SearchInput";
import "./SearchBar.css";

type Editor = Object;

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
  searchOn?: boolean,
  setActiveSearch: (?ActiveSearchType) => any,
  searchResults: SearchResults,
  modifiers: FileSearchModifiers,
  toggleFileSearchModifier: string => any,
  query: string,
  setFileSearchQuery: string => any,
  updateSearchResults: ({ count: number, index?: number }) => any,
  traverseResults: (boolean, Editor) => void,
  doSearch: (string, Editor) => void,
  closeFileSearch: Editor => void
};

class SearchBar extends Component {
  state: SearchBarState;
  props: Props;
  searchInput: HTMLInputElement;
  onChange: (e: SyntheticInputEvent) => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedResultIndex: 0,
      count: 0,
      index: -1
    };

    const self: any = this;
    self.onEscape = this.onEscape.bind(this);
    self.closeSearch = this.closeSearch.bind(this);
    self.selectSearchInput = this.selectSearchInput.bind(this);
    self.getInputRef = this.getInputRef.bind(this);
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
    const shortcuts = this.context.shortcuts;
    const { searchAgainShortcut, shiftSearchAgainShortcut } = getShortcuts();

    shortcuts.on("Escape", (_, e) => this.onEscape(e));

    shortcuts.on(shiftSearchAgainShortcut, (_, e) =>
      this.traverseResults(e, true)
    );

    shortcuts.on(searchAgainShortcut, (_, e) => this.traverseResults(e, false));
  }

  componentDidUpdate(prevProps: Props, prevState: SearchBarState) {
    if (this.searchInput && prevProps.searchOn !== this.props.searchOn) {
      this.selectSearchInput();
    }

    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }
  }

  onEscape(e: SyntheticKeyboardEvent) {
    this.closeSearch(e);
  }

  traverseResults(e: SyntheticKeyboardEvent, dir: boolean) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.props.editor) {
      return;
    }

    this.props.traverseResults(dir, this.props.editor);
  }

  closeSearch(e: SyntheticEvent) {
    const { editor } = this.props;

    if (!editor) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    this.props.closeFileSearch(editor);
  }

  selectSearchInput() {
    if (this.searchInput) {
      const { editor, searchOn, setFileSearchQuery } = this.props;
      if (searchOn && editor != null) {
        const selection = editor.codeMirror.getSelection();
        setFileSearchQuery(selection);
        if (selection !== "") {
          this.props.doSearch(selection, editor);
        }
      }
      this.searchInput.setSelectionRange(0, this.searchInput.value.length);
      this.searchInput.focus();
    }
  }

  onChange(e: SyntheticInputEvent) {
    if (!this.props.editor) {
      return;
    }
    return this.props.doSearch(e.target.value, this.props.editor);
  }

  onKeyUp(e: SyntheticKeyboardEvent) {
    if (e.key !== "Enter" && e.key !== "F3") {
      return;
    }

    this.traverseResults(e, e.shiftKey);
    e.preventDefault();
  }

  getInputRef(c) {
    this.searchInput = c;
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
      return null;
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
          handleNext={e => this.traverseResults(e, false)}
          handlePrev={e => this.traverseResults(e, true)}
          handleClose={this.closeSearch}
          refFunc={this.getInputRef}
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
      searchResults: getFileSearchResults(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SearchBar);
