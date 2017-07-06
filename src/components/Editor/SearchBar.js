// @flow

import { DOM as dom, createFactory, Component, PropTypes } from "react";
import { findDOMNode } from "react-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Svg from "../shared/Svg";
import actions from "../../actions";
import {
  getActiveSearchState,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getSearchResults
} from "../../selectors";

import {
  find,
  findNext,
  findPrev,
  removeOverlay,
  clearIndex
} from "../../utils/editor";

import { countMatches } from "../../utils/search";

import { scrollList } from "../../utils/result-list";
import classnames from "classnames";
import debounce from "lodash/debounce";

import { SourceEditor } from "devtools-source-editor";
import type { SourceRecord } from "../../reducers/sources";
import type {
  ActiveSearchType,
  FileSearchModifiers,
  SearchResults
} from "../../reducers/ui";
import type { SelectSourceOptions } from "../../actions/sources";
import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

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

import "./SearchBar.css";

class SearchBar extends Component {
  state: SearchBarState;

  props: {
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

  constructor(props) {
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
    self.toggleSearch = this.toggleSearch.bind(this);
    self.setSearchValue = this.setSearchValue.bind(this);
    self.selectSearchInput = this.selectSearchInput.bind(this);
    self.searchInput = this.searchInput.bind(this);
    self.doSearch = this.doSearch.bind(this);
    self.searchContents = this.searchContents.bind(this);
    self.traverseResults = this.traverseResults.bind(this);
    self.onChange = this.onChange.bind(this);
    self.onKeyUp = this.onKeyUp.bind(this);
    self.buildSummaryMsg = this.buildSummaryMsg.bind(this);
    self.renderSearchModifiers = this.renderSearchModifiers.bind(this);
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
    this.searchContents = debounce(this.searchContents, 100);

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

  componentDidUpdate(prevProps: any, prevState: any) {
    const { selectedSource, query, modifiers, searchOn } = this.props;
    const searchInput = this.searchInput();

    if (searchInput) {
      searchInput.focus();
    }

    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }

    const hasLoaded = selectedSource && !selectedSource.get("loading");
    const wasLoading =
      prevProps.selectedSource && prevProps.selectedSource.get("loading");

    const doneLoading = wasLoading && hasLoaded;
    const changedFiles =
      selectedSource != prevProps.selectedSource && hasLoaded;
    const modifiersUpdated =
      modifiers && !modifiers.equals(prevProps.modifiers);

    if (searchOn && (doneLoading || changedFiles || modifiersUpdated)) {
      this.doSearch(query);
    }
  }

  onEscape(e: SyntheticKeyboardEvent) {
    this.closeSearch(e);
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

  toggleSearch(e: SyntheticKeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    const { editor } = this.props;

    if (!this.props.searchOn) {
      this.props.setActiveSearch("file");
    }

    if (this.props.searchOn && editor) {
      const selection = editor.codeMirror.getSelection();
      this.setSearchValue(selection);
      if (selection !== "") {
        this.doSearch(selection);
      }
      this.selectSearchInput();
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

  doSearch(query: string) {
    const { selectedSource, setFileSearchQuery } = this.props;
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    setFileSearchQuery(query);

    this.searchContents(query);
  }

  async searchContents(query: string) {
    const {
      selectedSource,
      modifiers,
      editor: ed,
      searchResults: { index }
    } = this.props;

    if (!ed || !selectedSource || !selectedSource.get("text") || !modifiers) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const newCount = await countMatches(
      query,
      selectedSource.get("text"),
      modifiers.toJS()
    );

    if (index == -1) {
      clearIndex(ctx, query, modifiers.toJS());
    }

    const newIndex = find(ctx, query, true, modifiers.toJS());
    this.props.updateSearchResults({
      count: newCount,
      index: newIndex
    });
  }

  traverseResults(e: SyntheticEvent, rev: boolean) {
    e.stopPropagation();
    e.preventDefault();
    const ed = this.props.editor;

    if (!ed) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const {
      query,
      modifiers,
      updateSearchResults,
      searchResults: { count, index }
    } = this.props;

    if (query === "") {
      this.props.setActiveSearch("file");
    }

    if (index == -1 && modifiers) {
      clearIndex(ctx, query, modifiers.toJS());
    }

    if (modifiers) {
      const findFnc = rev ? findPrev : findNext;
      const newIndex = findFnc(ctx, query, true, modifiers.toJS());
      updateSearchResults({
        index: newIndex,
        count
      });
    }
  }

  // Handlers

  onChange(e: any) {
    return this.doSearch(e.target.value);
  }

  onKeyUp(e: SyntheticKeyboardEvent) {
    if (e.key !== "Enter" && e.key !== "F3") {
      return;
    }

    this.traverseResults(e, e.shiftKey);
    e.preventDefault();
  }
  // Renderers
  buildSummaryMsg() {
    const { searchResults: { count, index }, query } = this.props;

    if (query.trim() == "") {
      return "";
    }

    if (count == 0) {
      return L10N.getStr("editor.noResults");
    }

    if (index == -1) {
      return L10N.getFormatStr("sourceSearch.resultsSummary1", count);
    }

    return L10N.getFormatStr("editor.searchResults", index + 1, count);
  }

  renderSearchModifiers() {
    const { modifiers, toggleFileSearchModifier } = this.props;

    function searchModBtn(modVal, className, svgName, tooltip) {
      return dom.button(
        {
          className: classnames(className, {
            active: modifiers && modifiers.get(modVal)
          }),
          onClick: () => toggleFileSearchModifier(modVal),
          title: tooltip
        },
        Svg(svgName)
      );
    }

    return dom.div(
      { className: "search-modifiers" },
      searchModBtn(
        "regexMatch",
        "regex-match-btn",
        "regex-match",
        L10N.getStr("symbolSearch.searchModifier.regex")
      ),
      searchModBtn(
        "caseSensitive",
        "case-sensitive-btn",
        "case-match",
        L10N.getStr("symbolSearch.searchModifier.caseSensitive")
      ),
      searchModBtn(
        "wholeWord",
        "whole-word-btn",
        "whole-word-match",
        L10N.getStr("symbolSearch.searchModifier.wholeWord")
      )
    );
  }

  render() {
    const { searchResults: { count }, query, searchOn } = this.props;

    if (!searchOn) {
      return dom.div();
    }

    return dom.div(
      { className: "search-bar" },
      SearchInput({
        query,
        count,
        placeholder: L10N.getStr("sourceSearch.search.placeholder"),
        summaryMsg: this.buildSummaryMsg(),
        onChange: this.onChange,
        onKeyUp: this.onKeyUp,
        handleNext: e => this.traverseResults(e, false),
        handlePrev: e => this.traverseResults(e, true),
        handleClose: this.closeSearch
      }),
      dom.div({ className: "search-bottom-bar" }, this.renderSearchModifiers())
    );
  }
}

SearchBar.displayName = "SearchBar";
SearchBar.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => {
    return {
      searchOn: getActiveSearchState(state) === "file",
      query: getFileSearchQueryState(state),
      modifiers: getFileSearchModifierState(state),
      searchResults: getSearchResults(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SearchBar);
