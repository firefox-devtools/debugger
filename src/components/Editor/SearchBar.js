// @flow

import { DOM as dom, createFactory, Component, PropTypes } from "react";
import { findDOMNode } from "react-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { filter } from "fuzzaldrin-plus";
import Svg from "../shared/Svg";
import actions from "../../actions";
import {
  getFileSearchState,
  getFileSearchQueryState,
  getFileSearchModifierState,
  getSymbolSearchState,
  getSymbolSearchType,
  getSelectedSource,
  getSymbols
} from "../../selectors";

import {
  find,
  findNext,
  findPrev,
  removeOverlay,
  countMatches,
  clearIndex
} from "../../utils/editor";

import { scrollList } from "../../utils/result-list";
import classnames from "classnames";
import debounce from "lodash/debounce";

import { SourceEditor } from "devtools-source-editor";
import type { SourceRecord } from "../../reducers/sources";
import type { FileSearchModifiers, SymbolSearchType } from "../../reducers/ui";
import type { SelectSourceOptions } from "../../actions/sources";
import type { SearchResults } from ".";
import type { SymbolDeclarations } from "../../utils/parser/getSymbols";
import type { Location as BabelLocation } from "babel-traverse";
import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

import _ResultList from "../shared/ResultList";
const ResultList = createFactory(_ResultList);

import type { SymbolDeclaration } from "../../utils/parser/getSymbols";

export type FormattedSymbolDeclaration = {
  id: string,
  title: string,
  subtitle: string,
  value: string,
  location: BabelLocation,
  parameterNames?: string[]
};

function formatSymbol(symbol: SymbolDeclaration): FormattedSymbolDeclaration {
  return {
    id: `${symbol.name}:${symbol.location.start.line}`,
    title: symbol.name,
    subtitle: `:${symbol.location.start.line}`,
    value: symbol.name,
    location: symbol.location
  };
}

function getShortcuts() {
  const searchAgainKey = L10N.getStr("sourceSearch.search.again.key2");
  const searchAgainPrevKey = L10N.getStr("sourceSearch.search.againPrev.key2");
  const fnSearchKey = L10N.getStr("symbolSearch.search.key2");
  const searchKey = L10N.getStr("sourceSearch.search.key2");

  return {
    shiftSearchAgainShortcut: searchAgainPrevKey,
    searchAgainShortcut: searchAgainKey,
    symbolSearchShortcut: fnSearchKey,
    searchShortcut: searchKey
  };
}

type ToggleSymbolSearchOpts = {
  toggle: boolean,
  searchType: SymbolSearchType
};

type SearchBarState = {
  symbolSearchResults: Array<any>,
  selectedResultIndex: number,
  count: number,
  index: number
};

import "./SearchBar.css";

class SearchBar extends Component {
  state: SearchBarState;

  props: {
    editor?: SourceEditor,
    symbols: SymbolDeclarations,
    selectSource: (string, ?SelectSourceOptions) => any,
    selectedSource?: SourceRecord,
    highlightLineRange: ({ start: number, end: number }) => any,
    clearHighlightLineRange: () => any,
    searchOn?: boolean,
    toggleFileSearch: (?boolean) => any,
    searchResults: SearchResults,
    modifiers: FileSearchModifiers,
    toggleFileSearchModifier: string => any,
    symbolSearchOn: boolean,
    selectedSymbolType: SymbolSearchType,
    toggleSymbolSearch: boolean => any,
    setSelectedSymbolType: SymbolSearchType => any,
    query: string,
    setFileSearchQuery: string => any,
    updateSearchResults: ({ count: number, index?: number }) => any
  };

  constructor(props) {
    super(props);
    this.state = {
      symbolSearchResults: [],
      selectedResultIndex: 0,
      count: 0,
      index: -1
    };

    const self: any = this;
    self.onEscape = this.onEscape.bind(this);
    self.clearSearch = this.clearSearch.bind(this);
    self.closeSearch = this.closeSearch.bind(this);
    self.toggleSearch = this.toggleSearch.bind(this);
    self.toggleSymbolSearch = this.toggleSymbolSearch.bind(this);
    self.setSearchValue = this.setSearchValue.bind(this);
    self.selectSearchInput = this.selectSearchInput.bind(this);
    self.searchInput = this.searchInput.bind(this);
    self.updateSymbolSearchResults = this.updateSymbolSearchResults.bind(this);
    self.doSearch = this.doSearch.bind(this);
    self.searchContents = this.searchContents.bind(this);
    self.traverseSymbolResults = this.traverseSymbolResults.bind(this);
    self.traverseCodeResults = this.traverseCodeResults.bind(this);
    self.traverseResults = this.traverseResults.bind(this);
    self.selectResultItem = this.selectResultItem.bind(this);
    self.onSelectResultItem = this.onSelectResultItem.bind(this);
    self.onChange = this.onChange.bind(this);
    self.onKeyUp = this.onKeyUp.bind(this);
    self.onKeyDown = this.onKeyDown.bind(this);
    self.buildSummaryMsg = this.buildSummaryMsg.bind(this);
    self.buildPlaceHolder = this.buildPlaceHolder.bind(this);
    self.renderSearchModifiers = this.renderSearchModifiers.bind(this);
    self.renderSearchTypeToggle = this.renderSearchTypeToggle.bind(this);
    self.renderBottomBar = this.renderBottomBar.bind(this);
    self.renderResults = this.renderResults.bind(this);
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut,
      searchAgainShortcut,
      shiftSearchAgainShortcut,
      symbolSearchShortcut
    } = getShortcuts();

    shortcuts.off(searchShortcut);
    shortcuts.off("Escape");
    shortcuts.off(searchAgainShortcut);
    shortcuts.off(shiftSearchAgainShortcut);
    shortcuts.off(symbolSearchShortcut);
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
      shiftSearchAgainShortcut,
      symbolSearchShortcut
    } = getShortcuts();

    shortcuts.on(searchShortcut, (_, e) => this.toggleSearch(e));
    shortcuts.on("Escape", (_, e) => this.onEscape(e));

    shortcuts.on(shiftSearchAgainShortcut, (_, e) =>
      this.traverseResults(e, true)
    );

    shortcuts.on(searchAgainShortcut, (_, e) => this.traverseResults(e, false));

    shortcuts.on(symbolSearchShortcut, (_, e) =>
      this.toggleSymbolSearch(e, {
        toggle: false,
        searchType: "functions"
      })
    );
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const {
      selectedSource,
      query,
      modifiers,
      searchOn,
      symbolSearchOn,
      selectedSymbolType
    } = this.props;
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

    const isOpen = searchOn || symbolSearchOn;
    const changedSearchType =
      selectedSymbolType != prevProps.selectedSymbolType ||
      symbolSearchOn != prevProps.symbolSearchOn;

    if (
      isOpen &&
      (doneLoading || changedFiles || modifiersUpdated || changedSearchType)
    ) {
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
    const { editor, setFileSearchQuery } = this.props;

    if (this.props.searchOn && editor) {
      setFileSearchQuery("");
      this.clearSearch();
      this.props.toggleFileSearch(false);
      this.props.toggleSymbolSearch(false);
      this.props.setSelectedSymbolType("functions");
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
      this.props.toggleFileSearch();
    }

    if (this.props.symbolSearchOn) {
      this.clearSearch();
      this.props.toggleSymbolSearch(false);
      this.props.setSelectedSymbolType("functions");
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

  toggleSymbolSearch(
    e: SyntheticKeyboardEvent,
    { toggle, searchType }: ToggleSymbolSearchOpts = {}
  ) {
    const { selectedSource } = this.props;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!selectedSource) {
      return;
    }

    if (!this.props.searchOn) {
      this.props.toggleFileSearch();
    }

    if (this.props.symbolSearchOn) {
      if (toggle) {
        this.props.toggleSymbolSearch(false);
      } else {
        this.props.setSelectedSymbolType(searchType);
      }
      return;
    }

    if (this.props.selectedSource) {
      this.clearSearch();
      this.props.toggleSymbolSearch(true);
      this.props.setSelectedSymbolType(searchType);
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

  updateSymbolSearchResults(query: string) {
    const {
      selectedSource,
      updateSearchResults,
      selectedSymbolType,
      symbols
    } = this.props;

    if (query == "" || !selectedSource) {
      return;
    }

    const symbolSearchResults = filter(symbols[selectedSymbolType], query, {
      key: "value"
    });

    updateSearchResults({ count: symbolSearchResults.length });
    return this.setState({ symbolSearchResults });
  }

  doSearch(query: string) {
    const { selectedSource, setFileSearchQuery, editor: ed } = this.props;
    if (!selectedSource || !selectedSource.get("text")) {
      return;
    }

    setFileSearchQuery(query);

    if (this.props.symbolSearchOn) {
      return this.updateSymbolSearchResults(query);
    } else if (ed) {
      this.searchContents(query);
    }
  }

  searchContents(query: string) {
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

    const newCount = countMatches(
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

  traverseSymbolResults(rev: boolean) {
    const { symbolSearchResults, selectedResultIndex } = this.state;
    const searchResults = symbolSearchResults;
    const resultCount = searchResults.length;

    if (rev) {
      let nextResultIndex = Math.max(0, selectedResultIndex - 1);

      if (selectedResultIndex === 0) {
        nextResultIndex = resultCount - 1;
      }
      this.setState({ selectedResultIndex: nextResultIndex });
      this.onSelectResultItem(searchResults[nextResultIndex]);
    } else {
      let nextResultIndex = Math.min(resultCount - 1, selectedResultIndex + 1);

      if (selectedResultIndex === resultCount - 1) {
        nextResultIndex = 0;
      }
      this.setState({ selectedResultIndex: nextResultIndex });
      this.onSelectResultItem(searchResults[nextResultIndex]);
    }
  }

  traverseCodeResults(rev: boolean) {
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
      this.props.toggleFileSearch(true);
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

  traverseResults(e: SyntheticEvent, rev: boolean) {
    e.stopPropagation();
    e.preventDefault();

    const { symbolSearchOn } = this.props;

    if (symbolSearchOn) {
      return this.traverseSymbolResults(rev);
    }

    this.traverseCodeResults(rev);
  }

  // Handlers
  selectResultItem(e: SyntheticEvent, item: SymbolDeclaration) {
    const { selectSource, selectedSource } = this.props;

    if (selectedSource) {
      selectSource(selectedSource.get("id"), {
        line: item.location.start.line
      });

      this.closeSearch(e);
    }
  }

  onSelectResultItem(item: FormattedSymbolDeclaration) {
    const {
      selectSource,
      selectedSource,
      selectedSymbolType,
      highlightLineRange
    } = this.props;

    if (selectedSource && selectedSymbolType !== "functions") {
      selectSource(selectedSource.get("id"), {
        line: item.location.start.line
      });
    }

    if (selectedSource && selectedSymbolType === "functions") {
      highlightLineRange({
        start: item.location.start.line,
        end: item.location.end.line,
        sourceId: selectedSource.get("id")
      });
    }
  }

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

  onKeyDown(e: SyntheticKeyboardEvent) {
    const { symbolSearchOn } = this.props;
    const { symbolSearchResults } = this.state;
    if (!symbolSearchOn || this.props.query == "") {
      return;
    }

    const searchResults = symbolSearchResults;

    if (e.key === "ArrowUp") {
      this.traverseSymbolResults(true);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      this.traverseSymbolResults(false);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (searchResults.length) {
        this.selectResultItem(e, searchResults[this.state.selectedResultIndex]);
      }
      this.closeSearch(e);
      e.preventDefault();
    } else if (e.key === "Tab") {
      this.closeSearch(e);
      e.preventDefault();
    }
  }

  // Renderers
  buildSummaryMsg() {
    if (this.props.symbolSearchOn) {
      if (this.state.symbolSearchResults.length > 1) {
        return L10N.getFormatStr(
          "editor.searchResults",
          this.state.selectedResultIndex + 1,
          this.state.symbolSearchResults.length
        );
      } else if (this.state.symbolSearchResults.length === 1) {
        return L10N.getFormatStr("editor.singleResult");
      }
    }

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

  buildPlaceHolder() {
    const { symbolSearchOn, selectedSymbolType } = this.props;
    if (symbolSearchOn) {
      // prettier-ignore
      return L10N.getFormatStr(
        `symbolSearch.search.${selectedSymbolType}Placeholder`
      );
    }

    return L10N.getStr("sourceSearch.search.placeholder");
  }

  renderSearchModifiers() {
    const { modifiers, toggleFileSearchModifier, symbolSearchOn } = this.props;

    if (symbolSearchOn) {
      return null;
    }

    function searchModBtn(modVal, className, svgName, tooltip) {
      return dom.button(
        {
          className: classnames(className, {
            active: !symbolSearchOn && modifiers && modifiers.get(modVal)
          }),
          onClick: () =>
            !symbolSearchOn ? toggleFileSearchModifier(modVal) : null,
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

  renderSearchTypeToggle() {
    const { toggleSymbolSearch } = this;
    const { symbolSearchOn, selectedSymbolType } = this.props;

    function searchTypeBtn(searchType) {
      return dom.button(
        {
          className: classnames("search-type-btn", {
            active: symbolSearchOn && selectedSymbolType == searchType
          }),
          onClick: e => {
            if (selectedSymbolType == searchType) {
              toggleSymbolSearch(e, { toggle: true, searchType });
              return;
            }
            toggleSymbolSearch(e, { toggle: false, searchType });
          }
        },
        searchType
      );
    }

    return dom.section(
      { className: "search-type-toggles" },
      dom.h1(
        { className: "search-toggle-title" },
        L10N.getStr("editor.searchTypeToggleTitle")
      ),
      searchTypeBtn("functions"),
      searchTypeBtn("variables")
    );
  }

  renderBottomBar() {
    return dom.div(
      { className: "search-bottom-bar" },
      this.renderSearchTypeToggle(),
      this.renderSearchModifiers()
    );
  }

  renderResults() {
    const { symbolSearchResults, selectedResultIndex } = this.state;
    const { query, symbolSearchOn } = this.props;
    if (query == "" || !symbolSearchOn || !symbolSearchResults.length) {
      return;
    }

    return ResultList({
      items: symbolSearchResults,
      selected: selectedResultIndex,
      selectItem: this.selectResultItem,
      ref: "resultList"
    });
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
        placeholder: this.buildPlaceHolder(),
        summaryMsg: this.buildSummaryMsg(),
        onChange: this.onChange,
        onKeyUp: this.onKeyUp,
        onKeyDown: this.onKeyDown,
        handleNext: e => this.traverseResults(e, false),
        handlePrev: e => this.traverseResults(e, true),
        handleClose: this.closeSearch
      }),
      this.renderResults(),
      this.renderBottomBar()
    );
  }
}

SearchBar.displayName = "SearchBar";
SearchBar.contextTypes = {
  shortcuts: PropTypes.object
};

function _getFormattedSymbols(state) {
  const source = getSelectedSource(state);
  if (!source) {
    return { variables: [], functions: [] };
  }
  const { variables, functions } = getSymbols(state, source.toJS());

  return {
    variables: variables.map(formatSymbol),
    functions: functions.map(formatSymbol)
  };
}

export default connect(
  state => {
    return {
      searchOn: getFileSearchState(state),
      query: getFileSearchQueryState(state),
      modifiers: getFileSearchModifierState(state),
      symbolSearchOn: getSymbolSearchState(state),
      symbols: _getFormattedSymbols(state),
      selectedSymbolType: getSymbolSearchType(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SearchBar);
