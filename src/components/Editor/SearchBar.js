// @flow

const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { findDOMNode } = require("react-dom");
const { isEnabled } = require("devtools-config");
const { filter } = require("fuzzaldrin-plus");
const Svg = require("../shared/Svg");
const {
  find,
  findNext,
  findPrev,
  removeOverlay,
  countMatches,
  clearIndex
} = require("../../utils/editor");
const { getSymbols } = require("../../utils/parser");
const { scrollList } = require("../../utils/result-list");
const classnames = require("classnames");
const debounce = require("lodash/debounce");
const SearchInput = createFactory(require("../shared/SearchInput"));
const ResultList = createFactory(require("../shared/ResultList"));
const ImPropTypes = require("react-immutable-proptypes");

import type { FormattedSymbolDeclaration } from "../../utils/parser";

function getShortcuts() {
  const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
  const fnSearchKey = L10N.getStr("symbolSearch.search.key");

  return {
    shiftSearchAgainShortcut: `CmdOrCtrl+Shift+${searchAgainKey}`,
    searchAgainShortcut: `CmdOrCtrl+${searchAgainKey}`,
    symbolSearchShortcut: `CmdOrCtrl+Shift+${fnSearchKey}`,
    searchShortcut: `CmdOrCtrl+${L10N.getStr("sourceSearch.search.key")}`
  };
}

type ToggleSymbolSearchOpts = {
  toggle: boolean,
  searchType: string
}

require("./SearchBar.css");

const keyDownHandlers = {
  ArrowUp(event, searchResults, resultCount) {
    const selectedResultIndex = Math.max(0, this.state.selectedResultIndex - 1);

    this.setState({ selectedResultIndex });
    this.onSelectResultItem(searchResults[selectedResultIndex]);

    event.preventDefault();
  },

  ArrowDown(event, searchResults, resultCount) {
    const newIndex = this.state.selectedResultIndex + 1;
    const selectedResultIndex = Math.min(resultCount - 1, newIndex);

    this.setState({ selectedResultIndex });
    this.onSelectResultItem(searchResults[selectedResultIndex]);

    event.preventDefault();
  },

  Enter(event, searchResults) {
    if (searchResults.length) {
      const resultItem = searchResults[this.state.selectedResultIndex];
      this.selectResultItem(event, resultItem, 0);
    }

    this.closeSearch(event);
    event.preventDefault();
  },

  Tab(event) {
    this.closeSearch(event);
    event.preventDefault();
  }
};

const SearchBar = React.createClass({

  propTypes: {
    editor: PropTypes.object,
    sourceText: ImPropTypes.map,
    selectSource: PropTypes.func.isRequired,
    selectedSource: ImPropTypes.map,
    searchResults: PropTypes.object.isRequired,
    modifiers: PropTypes.object.isRequired,
    toggleModifier: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
    updateQuery: PropTypes.func.isRequired,
    updateSearchResults: PropTypes.func.isRequired
  },

  displayName: "SearchBar",

  getInitialState() {
    return {
      enabled: false,
      symbolSearchEnabled: false,
      selectedSymbolType: "functions",
      symbolSearchResults: [],
      selectedResultIndex: 0,
      count: 0,
      index: -1
    };
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut, searchAgainShortcut,
      shiftSearchAgainShortcut, symbolSearchShortcut
    } = getShortcuts();

    shortcuts.off(searchShortcut);
    shortcuts.off("Escape");
    shortcuts.off(searchAgainShortcut);
    shortcuts.off(shiftSearchAgainShortcut);
    shortcuts.off(symbolSearchShortcut);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut, searchAgainShortcut,
      shiftSearchAgainShortcut, symbolSearchShortcut
    } = getShortcuts();

    shortcuts.on(searchShortcut, (_, e) => this.toggleSearch(e));
    shortcuts.on("Escape", (_, e) => this.onEscape(e));

    shortcuts.on(
      shiftSearchAgainShortcut,
      (_, e) => this.traverseResults(e, true)
    );

    shortcuts.on(
      searchAgainShortcut,
      (_, e) => this.traverseResults(e, false)
    );

    if (isEnabled("symbolSearch")) {
      shortcuts.on(
        symbolSearchShortcut,
        (_, e) => this.toggleSymbolSearch(e, {
          toggle: false,
          searchType: "functions"
        })
      );
    }
  },

  componentDidUpdate(prevProps: any) {
    const { sourceText, selectedSource, query, modifiers } = this.props;

    if (this.searchInput()) {
      this.searchInput().focus();
    }

    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }

    const hasLoaded = sourceText && !sourceText.get("loading");
    const wasLoading = prevProps.sourceText
      && prevProps.sourceText.get("loading");

    const doneLoading = wasLoading && hasLoaded;
    const changedFiles = selectedSource != prevProps.selectedSource
      && hasLoaded;
    const modifiersUpdated = modifiers != prevProps.modifiers;

    const isOpen = this.state.enabled || this.state.symbolSearchEnabled;

    if (isOpen && (doneLoading || changedFiles || modifiersUpdated)) {
      this.doSearch(query);
    }
  },

  onEscape(e: SyntheticKeyboardEvent) {
    this.closeSearch(e);
  },

  clearSearch() {
    const { editor: ed, query, modifiers } = this.props;
    if (ed) {
      const ctx = { ed, cm: ed.codeMirror };
      this.props.updateQuery("");
      removeOverlay(ctx, query, modifiers);
    }
  },

  closeSearch(e: SyntheticEvent) {
    const { editor: ed } = this.props;

    if (this.state.enabled && ed) {
      this.clearSearch();
      this.setState({
        enabled: false,
        symbolSearchEnabled: false,
        selectedSymbolType: "functions"
      });
      e.stopPropagation();
      e.preventDefault();
    }
  },

  toggleSearch(e: SyntheticKeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    const { editor } = this.props;

    if (!this.state.enabled) {
      this.setState({ enabled: true });
    }

    if (this.state.symbolSearchEnabled) {
      this.clearSearch();
      this.setState({
        symbolSearchEnabled: false, selectedSymbolType: "functions" });
    }

    if (this.state.enabled && editor) {
      const selection = editor.codeMirror.getSelection();
      this.setSearchValue(selection);
      this.doSearch(selection);
      this.selectSearchInput();
    }
  },

  toggleSymbolSearch(e: SyntheticKeyboardEvent,
    { toggle, searchType }: ToggleSymbolSearchOpts = {}) {
    const { sourceText } = this.props;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!sourceText) {
      return;
    }

    if (!this.state.enabled) {
      this.setState({ enabled: true });
    }

    if (this.state.symbolSearchEnabled) {
      if (toggle) {
        this.setState({ symbolSearchEnabled: false });
      } else {
        this.setState({ selectedSymbolType: searchType });
      }
      return;
    }

    if (this.props.selectedSource) {
      this.clearSearch();
      this.setState({
        symbolSearchEnabled: true, selectedSymbolType: searchType });
    }
  },

  setSearchValue(value: string) {
    if (value == "") {
      return;
    }

    this.searchInput().value = value;
  },

  selectSearchInput() {
    const node = this.searchInput();
    if (node) {
      node.setSelectionRange(0, node.value.length);
    }
  },

  searchInput() {
    return findDOMNode(this).querySelector("input");
  },

  updateSymbolSearchResults(query: string) {
    const {
      sourceText,
      updateSearchResults
    } = this.props;
    const { selectedSymbolType } = this.state;

    if (query == "" || !sourceText) {
      return;
    }

    const symbolDeclarations = getSymbols(
      sourceText.toJS())[selectedSymbolType];

    const symbolSearchResults = filter(
      symbolDeclarations,
      query,
      { key: "value" }
    );

    updateSearchResults({ count: symbolSearchResults.length });
    return this.setState({ symbolSearchResults });
  },

  doSearch(query: string) {
    const {
      sourceText,
      modifiers,
      updateQuery,
      editor: ed,
      searchResults: { index }
    } = this.props;
    if (!sourceText || !sourceText.get("text")) {
      return;
    }

    updateQuery(query);

    if (this.state.symbolSearchEnabled) {
      return this.updateSymbolSearchResults(query);
    }

    if (!ed) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const newCount = countMatches(query, sourceText.get("text"), modifiers);

    if (index == -1) {
      clearIndex(ctx, query, modifiers);
    }

    const newIndex = find(ctx, query, true, modifiers);

    debounce(
      () => this.props.updateSearchResults({
        count: newCount,
        index: newIndex
      }),
      100
    )();
  },

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
      this.setState({ enabled: true });
    }

    if (index == -1) {
      clearIndex(ctx, query, modifiers);
    }

    const findFnc = rev ? findPrev : findNext;
    const newIndex = findFnc(ctx, query, true, modifiers);
    updateSearchResults({
      index: newIndex,
      count
    });
  },

  // Handlers
  selectResultItem(e: SyntheticEvent, item: FormattedSymbolDeclaration,
    index: number) {
    const { selectSource, selectedSource } = this.props;

    if (selectedSource) {
      this.setState({ selectedResultIndex: index });

      selectSource(
        selectedSource.get("id"), { line: item.location.start.line });

      this.closeSearch(e);
    }
  },

  onSelectResultItem(item: FormattedSymbolDeclaration) {
    const { selectSource, selectedSource } = this.props;
    if (selectedSource) {
      selectSource(
        selectedSource.get("id"), { line: item.location.start.line });
    }
  },

  onChange(e: any) {
    return this.doSearch(e.target.value);
  },

  onKeyUp(e: SyntheticKeyboardEvent) {
    if (e.key != "Enter") {
      return;
    }

    this.traverseResults(e, e.shiftKey);
  },

  onKeyDown(e: SyntheticKeyboardEvent) {
    if (!this.state.symbolSearchEnabled || this.props.query == "") {
      return;
    }

    const searchResults = this.state.symbolSearchResults,
      resultCount = searchResults.length;

    keyDownHandlers[e.key] && keyDownHandlers[e.key]
      .call(this, e, searchResults, resultCount);
  },

  // Renderers
  buildSummaryMsg() {
    if (this.state.symbolSearchEnabled) {
      return L10N.getFormatStr("sourceSearch.resultsSummary1",
        this.state.symbolSearchResults.length);
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
  },

  buildPlaceHolder() {
    const { symbolSearchEnabled, selectedSymbolType } = this.state;
    if (symbolSearchEnabled) {
      return L10N
        .getFormatStr(`symbolSearch.search.${selectedSymbolType}Placeholder`);
    }

    return L10N.getStr("sourceSearch.search.placeholder");
  },

  renderSearchModifiers() {
    if (!isEnabled("searchModifiers")) {
      return;
    }

    const {
      modifiers: { caseSensitive, wholeWord, regexMatch },
      toggleModifier } = this.props;
    const { symbolSearchEnabled } = this.state;

    function searchModBtn(modVal, className, svgName) {
      const defaultMods = { caseSensitive, wholeWord, regexMatch };
      return dom.button({
        className: classnames(className, {
          active: !symbolSearchEnabled && !Object.values(modVal)[0],
          disabled: symbolSearchEnabled
        }),
        onClick: () => !symbolSearchEnabled ?
        toggleModifier(Object.assign(defaultMods, modVal)) : null
      }, Svg(svgName));
    }

    return dom.div(
      { className: "search-modifiers" },
      searchModBtn({
        regexMatch: !regexMatch
      }, "regex-match-btn", "regex-match"),
      searchModBtn({
        caseSensitive: !caseSensitive
      }, "case-sensitive-btn", "case-match"),
      searchModBtn({
        wholeWord: !wholeWord
      }, "whole-word-btn", "whole-word-match")
    );
  },

  renderSearchTypeToggle() {
    if (!isEnabled("symbolSearch")) {
      return;
    }
    const { toggleSymbolSearch } = this;
    const { symbolSearchEnabled, selectedSymbolType } = this.state;
    const { sourceText } = this.props;

    function searchTypeBtn(searchType) {
      return dom.button({
        className: classnames("search-type-btn", {
          active: symbolSearchEnabled && selectedSymbolType == searchType
        }),
        onClick: e => {
          if (selectedSymbolType == searchType) {
            toggleSymbolSearch(e, { toggle: true, searchType });
            return;
          }
          toggleSymbolSearch(e, { toggle: false, searchType });
        }
      }, searchType);
    }

    let classSearchBtn;
    if (sourceText) {
      const symbolDeclarations = getSymbols(sourceText.toJS());
      if (symbolDeclarations.classes.length) {
        classSearchBtn = searchTypeBtn("classes");
      }
    }

    return dom.section(
      { className: "search-type-toggles" },
      dom.h1(
        { className: "search-toggle-title" },
        "Search for:"
      ),
      searchTypeBtn("functions"),
      searchTypeBtn("variables"),
      classSearchBtn
    );
  },

  renderBottomBar() {
    if (!isEnabled("searchModifiers") || !isEnabled("symbolSearch")) {
      return;
    }

    return dom.div(
      { className: "search-bottom-bar" },
      this.renderSearchTypeToggle(),
      this.renderSearchModifiers()
    );
  },

  renderResults() {
    const {
      symbolSearchEnabled, symbolSearchResults, selectedResultIndex
    } = this.state;
    const { query } = this.props;
    if (query == "" ||
      !symbolSearchEnabled || !symbolSearchResults.length) {
      return;
    }

    return ResultList({
      items: symbolSearchResults,
      selected: selectedResultIndex,
      selectItem: this.selectResultItem,
      ref: "resultList"
    });
  },

  render() {
    const {
      searchResults: { count },
      query,
    } = this.props;

    if (!this.state.enabled) {
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
        handleClose: this.closeSearch
      }),
      this.renderResults(),
      this.renderBottomBar()
    );
  }
});

module.exports = SearchBar;
