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
const { getFunctions } = require("../../utils/parser");
const { scrollList } = require("../../utils/result-list");
const classnames = require("classnames");
const debounce = require("lodash/debounce");
const SearchInput = createFactory(require("../shared/SearchInput"));
const ResultList = createFactory(require("../shared/ResultList"));
const ImPropTypes = require("react-immutable-proptypes");

import type { FunctionDeclaration } from "../../utils/parser";

require("./SearchBar.css");

const SearchBar = React.createClass({

  propTypes: {
    editor: PropTypes.object,
    sourceText: ImPropTypes.map,
    selectSource: PropTypes.func.isRequired,
    selectedSource: ImPropTypes.map.isRequired,
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
      functionSearchEnabled: false,
      functionDeclarations: [],
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
    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    const fnSearchKey = L10N.getStr("functionSearch.search.key");
    shortcuts.off(`CmdOrCtrl+${L10N.getStr("sourceSearch.search.key")}`);
    shortcuts.off("Escape");
    shortcuts.off(`CmdOrCtrl+Shift+${searchAgainKey}`);
    shortcuts.off(`CmdOrCtrl+${searchAgainKey}`);
    shortcuts.off(`CmdOrCtrl+Shift+${fnSearchKey}`);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    const fnSearchKey = L10N.getStr("functionSearch.search.key");
    shortcuts.on(`CmdOrCtrl+${L10N.getStr("sourceSearch.search.key")}`,
      (_, e) => this.toggleSearch(e));
    shortcuts.on("Escape", (_, e) => this.onEscape(e));
    shortcuts.on(`CmdOrCtrl+Shift+${searchAgainKey}`,
      (_, e) => this.traverseResults(e, true));
    shortcuts.on(`CmdOrCtrl+${searchAgainKey}`,
      (_, e) => this.traverseResults(e, false));
    if (isEnabled("functionSearch")) {
      shortcuts.on(`CmdOrCtrl+Shift+${fnSearchKey}`,
        (_, e) => this.toggleFunctionSearch(e));
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

    const isOpen = this.state.enabled || this.state.functionSearchEnabled;

    if (isOpen && (doneLoading || changedFiles || modifiersUpdated)) {
      this.doSearch(query);
    }
  },

  onEscape(e: SyntheticKeyboardEvent) {
    if (this.state.functionSearchEnabled) {
      this.toggleFunctionSearch(e);
    }
    this.closeSearch(e);
  },

  closeSearch(e: SyntheticEvent) {
    const { editor: ed, query, modifiers } = this.props;

    if (this.state.enabled && ed) {
      this.setState({ enabled: false });
      const ctx = { ed, cm: ed.codeMirror };
      removeOverlay(ctx, query, modifiers);
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

    if (this.state.enabled && editor) {
      const selection = editor.codeMirror.getSelection();
      this.setSearchValue(selection);
      this.doSearch(selection);
      this.selectSearchInput();
    }
  },

  toggleFunctionSearch(e?: SyntheticKeyboardEvent) {
    if (e) {
      e.preventDefault();
    }

    if (!this.state.enabled) {
      this.setState({ enabled: true });
    }

    if (this.state.functionSearchEnabled) {
      return this.setState({ enabled: false, functionSearchEnabled: false });
    }

    const functionDeclarations = getFunctions(
      this.props.selectedSource.toJS()
    ).map(dec => ({
      id: `${dec.name}:${dec.location.start.line}`,
      title: dec.name,
      subtitle: `:${dec.location.start.line}`,
      value: dec.name,
      location: dec.location
    }));

    this.setState({
      functionSearchEnabled: true,
      functionDeclarations
    });
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

  getFunctionResults() {
    const { query } = this.props;
    if (query == "") {
      return [];
    }

    return filter(this.state.functionDeclarations, query, { key: "value" });
  },

  // Handlers
  selectResultItem(item: FunctionDeclaration) {
    const { selectSource, selectedSource } = this.props;
    this.toggleFunctionSearch();
    selectSource(selectedSource.get("id"), { line: item.location.start.line });
  },

  onSelectResultItem(item: FunctionDeclaration) {
    const { selectSource, selectedSource } = this.props;
    selectSource(selectedSource.get("id"), { line: item.location.start.line });
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
    if (!this.state.functionSearchEnabled || this.props.query == "") {
      return;
    }

    const searchResults = this.getFunctionResults(),
      resultCount = searchResults.length;

    if (e.key === "ArrowUp") {
      const selectedResultIndex = Math
        .max(0, this.state.selectedResultIndex - 1);
      this.setState({ selectedResultIndex });
      this.onSelectResultItem(searchResults[selectedResultIndex]);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const selectedResultIndex = Math
        .min(resultCount - 1, this.state.selectedResultIndex + 1);
      this.setState({ selectedResultIndex });
      this.onSelectResultItem(searchResults[selectedResultIndex]);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (searchResults.length) {
        this.selectResultItem(searchResults[this.state.selectedResultIndex]);
      } else {
        this.closeSearch(e);
      }
      e.preventDefault();
    } else if (e.key === "Tab") {
      this.closeSearch(e);
      e.preventDefault();
    }
  },

  // Renderers
  buildSummaryMsg() {
    const {
      searchResults: { count, index },
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

    return L10N.getFormatStr("editor.searchResults", index + 1, count);
  },

  buildPlaceHolder() {
    if (this.state.functionSearchEnabled) {
      return "Search for function...";
    }

    return "Search in file...";
  },

  renderSearchModifiers() {
    if (!isEnabled("searchModifiers")) {
      return;
    }

    const {
      modifiers: { caseSensitive, wholeWord, regexMatch },
      toggleModifier } = this.props;

    return dom.div(
      { className: "search-modifiers" },
      // render buttons. On clicks toggle search modifiers.
      dom.button({
        className: classnames("regex-match-btn",
          { active: regexMatch }),
        onClick: () => {
          toggleModifier(
            { caseSensitive, wholeWord, regexMatch: !regexMatch });
          this.doSearch(this.props.query);
        }
      }, Svg("regex-match")),
      dom.button({
        className: classnames("case-sensitive-btn",
          { active: caseSensitive }),
        onClick: () => {
          toggleModifier(
            { caseSensitive: !caseSensitive, wholeWord, regexMatch });
          this.doSearch(this.props.query);
        }
      }, Svg("case-match")),
      dom.button({
        className: classnames("whole-word-btn",
          { active: wholeWord }),
        onClick: () => {
          toggleModifier(
            { caseSensitive, wholeWord: !wholeWord, regexMatch });
          this.doSearch(this.props.query);
        }
      }, Svg("whole-word-match")),
    );
  },

  renderSearchTypeToggle() {
    if (!isEnabled("functionSearch")) {
      return;
    }

    return dom.section(
      { className: "search-type-toggles" },
      dom.h1(
        { className: "search-toggle-title" },
        "Search for:"
      ),
      dom.button({
        className: classnames("search-type-btn", {
          active: this.state.functionSearchEnabled
        }),
        onClick: this.toggleFunctionSearch
      }, "functions")
    );
  },

  renderBottomBar() {
    if (!isEnabled("searchModifiers") || !isEnabled("functionSearch")) {
      return;
    }

    return dom.div(
      { className: "search-bottom-bar" },
      this.renderSearchTypeToggle(),
      this.renderSearchModifiers()
    );
  },

  renderResults() {
    const results = this.getFunctionResults();
    if (!this.state.functionSearchEnabled || !results.length) {
      return;
    }

    return ResultList({
      items: results,
      selected: this.state.selectedResultIndex,
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
      this.renderBottomBar(),
      this.renderResults()
    );
  }
});

module.exports = SearchBar;
