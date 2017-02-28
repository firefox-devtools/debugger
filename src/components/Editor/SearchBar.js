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

type ToggleFunctionSearchOpts = {
  toggle: boolean
}

require("./SearchBar.css");

function getFunctionDeclarations(selectedSource) {
  return getFunctions(selectedSource).map(dec => ({
    id: `${dec.name}:${dec.location.start.line}`,
    title: dec.name,
    subtitle: `:${dec.location.start.line}`,
    value: dec.name,
    location: dec.location
  }));
}

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
      functionSearchEnabled: false,
      functionDeclarations: [],
      functionSearchResults: [],
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
        (_, e) => this.toggleFunctionSearch(e, { toggle: false }));
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
      this.setState({ enabled: false, functionSearchEnabled: false });
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

    if (this.state.functionSearchEnabled) {
      this.clearSearch();
      this.setState({ functionSearchEnabled: false });
    }

    if (this.state.enabled && editor) {
      const selection = editor.codeMirror.getSelection();
      this.setSearchValue(selection);
      this.doSearch(selection);
      this.selectSearchInput();
    }
  },

  toggleFunctionSearch(
    e?: SyntheticKeyboardEvent, { toggle }: ToggleFunctionSearchOpts = {}) {
    const { selectedSource } = this.props;

    if (e) {
      e.preventDefault();
    }

    if (!selectedSource) {
      return;
    }

    if (!this.state.enabled) {
      this.setState({ enabled: true });
    }

    if (this.state.functionSearchEnabled) {
      if (toggle) {
        this.setState({ functionSearchEnabled: false });
      }

      return;
    }

    const functionDeclarations = getFunctionDeclarations(
      selectedSource.toJS()
    );

    if (this.props.selectedSource) {
      this.clearSearch();
      this.setState({
        functionSearchEnabled: true,
        functionDeclarations
      });
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

    if (this.state.functionSearchEnabled) {
      if (query == "") {
        return;
      }

      const functionSearchResults = filter(
        this.state.functionDeclarations, query, { key: "value" });

      this.props.updateSearchResults({ count: functionSearchResults.length });
      return this.setState({ functionSearchResults });
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
  selectResultItem(item: FunctionDeclaration) {
    const { selectSource, selectedSource } = this.props;
    this.toggleFunctionSearch();
    if (selectedSource) {
      selectSource(
        selectedSource.get("id"), { line: item.location.start.line });
    }
  },

  onSelectResultItem(item: FunctionDeclaration) {
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
    if (!this.state.functionSearchEnabled || this.props.query == "") {
      return;
    }

    const searchResults = this.state.functionSearchResults,
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
    if (this.state.functionSearchEnabled) {
      return L10N.getFormatStr("sourceSearch.resultsSummary1",
        this.state.functionSearchResults.length);
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
    if (this.state.functionSearchEnabled) {
      return L10N.getStr("functionSearch.search.placeholder");
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
    const { functionSearchEnabled } = this.state;

    function searchModBtn(modVal, className, svgName) {
      const defaultMods = { caseSensitive, wholeWord, regexMatch };
      return dom.button({
        className: classnames(className, {
          active: !functionSearchEnabled && !Object.values(modVal)[0],
          disabled: functionSearchEnabled
        }),
        onClick: () => !functionSearchEnabled ?
        toggleModifier(Object.assign(defaultMods, modVal)) : null
      }, Svg(svgName));
    }

    return dom.div(
      { className: "search-modifiers" },
      searchModBtn({
        regexMatch: !regexMatch }, "regex-match-btn", "regex-match"),
      searchModBtn({
        caseSensitive: !caseSensitive }, "case-sensitive-btn", "case-match"),
      searchModBtn({
        wholeWord: !wholeWord }, "whole-word-btn", "whole-word-match")
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
        onClick: e => this.toggleFunctionSearch(e, { toggle: true })
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
    const {
      functionSearchEnabled, functionSearchResults, selectedResultIndex
    } = this.state;
    const { query } = this.props;
    if (query == "" ||
      !functionSearchEnabled || !functionSearchResults.length) {
      return;
    }

    return ResultList({
      items: functionSearchResults,
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
      this.renderBottomBar(),
      this.renderResults()
    );
  }
});

module.exports = SearchBar;
