// @flow

const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { findDOMNode } = require("react-dom");
const { isEnabled } = require("devtools-config");
const { filter } = require("fuzzaldrin-plus");
const Svg = require("../shared/Svg");
const actions = require("../../actions");
const {
  getFileSearchState,
  getFileSearchQueryState,
  getFileSearchModifierState,
} = require("../../selectors");
const {
  find,
  findNext,
  findPrev,
  removeOverlay,
  countMatches,
  clearIndex,
} = require("../../utils/editor");
const { getSymbols } = require("../../utils/parser");
const { scrollList } = require("../../utils/result-list");
const classnames = require("classnames");
const debounce = require("lodash/debounce");
const SearchInput = createFactory(require("../shared/SearchInput"));
const ResultList = createFactory(require("../shared/ResultList"));
const ImPropTypes = require("react-immutable-proptypes");

import type { FormattedSymbolDeclaration } from "../../utils/parser/utils";

function getShortcuts() {
  const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
  const fnSearchKey = L10N.getStr("symbolSearch.search.key");

  return {
    shiftSearchAgainShortcut: `CmdOrCtrl+Shift+${searchAgainKey}`,
    searchAgainShortcut: `CmdOrCtrl+${searchAgainKey}`,
    symbolSearchShortcut: `CmdOrCtrl+Shift+${fnSearchKey}`,
    searchShortcut: `CmdOrCtrl+${L10N.getStr("sourceSearch.search.key")}`,
  };
}

type ToggleSymbolSearchOpts = {
  toggle: boolean,
  searchType: string,
};

require("./SearchBar.css");

const SearchBar = React.createClass({
  propTypes: {
    editor: PropTypes.object,
    sourceText: ImPropTypes.map,
    selectSource: PropTypes.func.isRequired,
    selectedSource: ImPropTypes.map,
    searchOn: PropTypes.bool,
    toggleFileSearch: PropTypes.func.isRequired,
    searchResults: PropTypes.object.isRequired,
    modifiers: ImPropTypes.recordOf({
      caseSensitive: PropTypes.bool.isRequired,
      regexMatch: PropTypes.bool.isRequired,
      wholeWord: PropTypes.bool.isRequired,
    }).isRequired,
    toggleFileSearchModifier: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
    setFileSearchQuery: PropTypes.func.isRequired,
    updateSearchResults: PropTypes.func.isRequired,
  },

  displayName: "SearchBar",

  getInitialState() {
    return {
      symbolSearchEnabled: false,
      selectedSymbolType: "functions",
      symbolSearchResults: [],
      selectedResultIndex: 0,
      count: 0,
      index: -1,
    };
  },

  contextTypes: {
    shortcuts: PropTypes.object,
  },

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut,
      searchAgainShortcut,
      shiftSearchAgainShortcut,
      symbolSearchShortcut,
    } = getShortcuts();

    shortcuts.off(searchShortcut);
    shortcuts.off("Escape");
    shortcuts.off(searchAgainShortcut);
    shortcuts.off(shiftSearchAgainShortcut);
    shortcuts.off(symbolSearchShortcut);
  },

  componentDidMount() {
    // overwrite searchContents with a debounced version to reduce the
    // frequency of queries which improves perf on large files
    this.searchContents = debounce(this.searchContents, 100);

    const shortcuts = this.context.shortcuts;
    const {
      searchShortcut,
      searchAgainShortcut,
      shiftSearchAgainShortcut,
      symbolSearchShortcut,
    } = getShortcuts();

    shortcuts.on(searchShortcut, (_, e) => this.toggleSearch(e));
    shortcuts.on("Escape", (_, e) => this.onEscape(e));

    shortcuts.on(shiftSearchAgainShortcut, (_, e) =>
      this.traverseResults(e, true));

    shortcuts.on(searchAgainShortcut, (_, e) => this.traverseResults(e, false));

    if (isEnabled("symbolSearch")) {
      shortcuts.on(symbolSearchShortcut, (_, e) =>
        this.toggleSymbolSearch(e, {
          toggle: false,
          searchType: "functions",
        }));
    }
  },

  componentDidUpdate(prevProps: any, prevState: any) {
    const { sourceText, selectedSource, query, modifiers } = this.props;

    if (this.searchInput()) {
      this.searchInput().focus();
    }

    if (this.refs.resultList && this.refs.resultList.refs) {
      scrollList(this.refs.resultList.refs, this.state.selectedResultIndex);
    }

    const hasLoaded = sourceText && !sourceText.get("loading");
    const wasLoading = prevProps.sourceText &&
      prevProps.sourceText.get("loading");

    const doneLoading = wasLoading && hasLoaded;
    const changedFiles = selectedSource != prevProps.selectedSource &&
      hasLoaded;
    const modifiersUpdated = !modifiers.equals(prevProps.modifiers);

    const isOpen = this.props.searchOn || this.state.symbolSearchEnabled;
    const { selectedSymbolType, symbolSearchEnabled } = this.state;
    const changedSearchType = selectedSymbolType !=
      prevState.selectedSymbolType ||
      symbolSearchEnabled != prevState.symbolSearchEnabled;

    if (
      isOpen &&
      (doneLoading || changedFiles || modifiersUpdated || changedSearchType)
    ) {
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
      removeOverlay(ctx, query, modifiers.toJS());
    }
  },

  closeSearch(e: SyntheticEvent) {
    const { editor: ed } = this.props;

    if (this.props.searchOn && ed) {
      this.clearSearch();
      this.props.toggleFileSearch(false);
      this.setState({
        symbolSearchEnabled: false,
        selectedSymbolType: "functions",
      });
      e.stopPropagation();
      e.preventDefault();
    }
  },

  toggleSearch(e: SyntheticKeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    const { editor } = this.props;

    if (!this.props.searchOn) {
      this.props.toggleFileSearch();
    }

    if (this.state.symbolSearchEnabled) {
      this.clearSearch();
      this.setState({
        symbolSearchEnabled: false,
        selectedSymbolType: "functions",
      });
    }

    if (this.props.searchOn && editor) {
      const selection = editor.codeMirror.getSelection();
      this.setSearchValue(selection);
      if (selection !== "") {
        this.doSearch(selection);
      }
      this.selectSearchInput();
    }
  },

  toggleSymbolSearch(
    e: SyntheticKeyboardEvent,
    { toggle, searchType }: ToggleSymbolSearchOpts = {},
  ) {
    const { sourceText } = this.props;

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!sourceText) {
      return;
    }

    if (!this.props.searchOn) {
      this.props.toggleFileSearch();
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
        symbolSearchEnabled: true,
        selectedSymbolType: searchType,
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

  async updateSymbolSearchResults(query: string) {
    const {
      sourceText,
      updateSearchResults,
    } = this.props;
    const { selectedSymbolType } = this.state;

    if (query == "" || !sourceText) {
      return;
    }

    const symbolDeclarations = await getSymbols(sourceText.toJS());
    const symbolSearchResults = filter(
      symbolDeclarations[selectedSymbolType],
      query,
      { key: "value" },
    );

    updateSearchResults({ count: symbolSearchResults.length });
    return this.setState({ symbolSearchResults });
  },

  async doSearch(query: string) {
    const {
      sourceText,
      setFileSearchQuery,
      editor: ed,
    } = this.props;
    if (!sourceText || !sourceText.get("text")) {
      return;
    }

    setFileSearchQuery(query);

    if (this.state.symbolSearchEnabled) {
      return await this.updateSymbolSearchResults(query);
    } else if (ed) {
      this.searchContents(query);
    }
  },

  searchContents(query: string) {
    const {
      sourceText,
      modifiers,
      editor: ed,
      searchResults: { index },
    } = this.props;

    if (!ed || !sourceText || !sourceText.get("text")) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const newCount = countMatches(
      query,
      sourceText.get("text"),
      modifiers.toJS(),
    );

    if (index == -1) {
      clearIndex(ctx, query, modifiers.toJS());
    }

    const newIndex = find(ctx, query, true, modifiers.toJS());
    this.props.updateSearchResults({
      count: newCount,
      index: newIndex,
    });
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
      searchResults: { count, index },
    } = this.props;

    if (query === "") {
      this.props.toggleFileSearch(true);
    }

    if (index == -1) {
      clearIndex(ctx, query, modifiers.toJS());
    }

    const findFnc = rev ? findPrev : findNext;
    const newIndex = findFnc(ctx, query, true, modifiers.toJS());
    updateSearchResults({
      index: newIndex,
      count,
    });
  },

  // Handlers
  selectResultItem(item: FormattedSymbolDeclaration) {
    const { selectSource, selectedSource } = this.props;
    if (selectedSource) {
      selectSource(selectedSource.get("id"), {
        line: item.location.start.line,
      });
    }
  },

  onSelectResultItem(item: FormattedSymbolDeclaration) {
    const { selectSource, selectedSource } = this.props;
    if (selectedSource) {
      selectSource(selectedSource.get("id"), {
        line: item.location.start.line,
      });
    }
  },

  async onChange(e: any) {
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

    if (e.key === "ArrowUp") {
      const selectedResultIndex = Math.max(
        0,
        this.state.selectedResultIndex - 1,
      );
      this.setState({ selectedResultIndex });
      this.onSelectResultItem(searchResults[selectedResultIndex]);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const selectedResultIndex = Math.min(
        resultCount - 1,
        this.state.selectedResultIndex + 1,
      );
      this.setState({ selectedResultIndex });
      this.onSelectResultItem(searchResults[selectedResultIndex]);
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (searchResults.length) {
        this.selectResultItem(searchResults[this.state.selectedResultIndex]);
      }
      this.closeSearch(e);
      e.preventDefault();
    } else if (e.key === "Tab") {
      this.closeSearch(e);
      e.preventDefault();
    }
  },

  // Renderers
  buildSummaryMsg() {
    if (this.state.symbolSearchEnabled) {
      return L10N.getFormatStr(
        "sourceSearch.resultsSummary1",
        this.state.symbolSearchResults.length,
      );
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
      return L10N.getFormatStr(
        `symbolSearch.search.${selectedSymbolType}Placeholder`,
      );
    }

    return L10N.getStr("sourceSearch.search.placeholder");
  },

  renderSearchModifiers() {
    if (!isEnabled("searchModifiers")) {
      return;
    }

    const {
      modifiers,
      toggleFileSearchModifier,
    } = this.props;
    const { symbolSearchEnabled } = this.state;

    function searchModBtn(modVal, className, svgName) {
      return dom.button(
        {
          className: classnames(className, {
            active: !symbolSearchEnabled && modifiers.get(modVal),
            disabled: symbolSearchEnabled,
          }),
          onClick: () =>
            !symbolSearchEnabled ? toggleFileSearchModifier(modVal) : null,
        },
        Svg(svgName),
      );
    }

    return dom.div(
      { className: "search-modifiers" },
      searchModBtn("regexMatch", "regex-match-btn", "regex-match"),
      searchModBtn("caseSensitive", "case-sensitive-btn", "case-match"),
      searchModBtn("wholeWord", "whole-word-btn", "whole-word-match"),
    );
  },

  renderSearchTypeToggle() {
    if (!isEnabled("symbolSearch")) {
      return;
    }
    const { toggleSymbolSearch } = this;
    const { symbolSearchEnabled, selectedSymbolType } = this.state;

    function searchTypeBtn(searchType) {
      return dom.button(
        {
          className: classnames("search-type-btn", {
            active: symbolSearchEnabled && selectedSymbolType == searchType,
          }),
          onClick: e => {
            if (selectedSymbolType == searchType) {
              toggleSymbolSearch(e, { toggle: true, searchType });
              return;
            }
            toggleSymbolSearch(e, { toggle: false, searchType });
          },
        },
        searchType,
      );
    }

    let classSearchBtn;

    return dom.section(
      { className: "search-type-toggles" },
      dom.h1({ className: "search-toggle-title" }, "Search for:"),
      searchTypeBtn("functions"),
      searchTypeBtn("variables"),
      classSearchBtn,
    );
  },

  renderBottomBar() {
    if (!isEnabled("searchModifiers") || !isEnabled("symbolSearch")) {
      return;
    }

    return dom.div(
      { className: "search-bottom-bar" },
      this.renderSearchTypeToggle(),
      this.renderSearchModifiers(),
    );
  },

  renderResults() {
    const {
      symbolSearchEnabled,
      symbolSearchResults,
      selectedResultIndex,
    } = this.state;
    const { query } = this.props;
    if (query == "" || !symbolSearchEnabled || !symbolSearchResults.length) {
      return;
    }

    return ResultList({
      items: symbolSearchResults,
      selected: selectedResultIndex,
      selectItem: this.selectResultItem,
      ref: "resultList",
    });
  },

  render() {
    const {
      searchResults: { count },
      query,
    } = this.props;

    if (!this.props.searchOn) {
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
        handleClose: this.closeSearch,
      }),
      this.renderResults(),
      this.renderBottomBar(),
    );
  },
});

module.exports = connect(
  state => {
    return {
      searchOn: getFileSearchState(state),
      query: getFileSearchQueryState(state),
      modifiers: getFileSearchModifierState(state),
    };
  },
  dispatch => bindActionCreators(actions, dispatch),
)(SearchBar);
