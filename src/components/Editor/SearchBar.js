// @flow

import { DOM as dom, PropTypes, createFactory, Component } from "react";
import { findDOMNode } from "../../../node_modules/react-dom/dist/react-dom";
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
  getSymbolSearchType
} from "../../selectors";

import {
  find,
  findNext,
  findPrev,
  removeOverlay,
  countMatches,
  clearIndex
} from "../../utils/editor";

import { getSymbols } from "../../utils/parser";
import { scrollList } from "../../utils/result-list";
import classnames from "classnames";
import debounce from "lodash/debounce";
import ImPropTypes from "react-immutable-proptypes";

import _SearchInput from "../shared/SearchInput";
const SearchInput = createFactory(_SearchInput);

import _ResultList from "../shared/ResultList";
const ResultList = createFactory(_ResultList);

import type {
  FormattedSymbolDeclaration,
  SymbolDeclaration
} from "../../utils/parser/utils";

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
      sourceText,
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

    const hasLoaded = sourceText && !sourceText.get("loading");
    const wasLoading =
      prevProps.sourceText && prevProps.sourceText.get("loading");

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
    const { editor: ed } = this.props;

    if (this.props.searchOn && ed) {
      this.clearSearch();
      this.props.toggleFileSearch(false);
      this.props.toggleSymbolSearch(false);
      this.props.setSelectedSymbolType("functions");
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

  async updateSymbolSearchResults(query: string) {
    const { sourceText, updateSearchResults, selectedSymbolType } = this.props;

    if (query == "" || !sourceText) {
      return;
    }

    const symbolDeclarations = await getSymbols(sourceText.toJS());
    const symbolSearchResults = filter(
      symbolDeclarations[selectedSymbolType],
      query,
      { key: "value" }
    );

    updateSearchResults({ count: symbolSearchResults.length });
    return this.setState({ symbolSearchResults });
  }

  async doSearch(query: string) {
    const { sourceText, setFileSearchQuery, editor: ed } = this.props;
    if (!sourceText || !sourceText.get("text")) {
      return;
    }

    setFileSearchQuery(query);

    if (this.props.symbolSearchOn) {
      return await this.updateSymbolSearchResults(query);
    } else if (ed) {
      this.searchContents(query);
    }
  }

  searchContents(query: string) {
    const {
      sourceText,
      modifiers,
      editor: ed,
      searchResults: { index }
    } = this.props;

    if (!ed || !sourceText || !sourceText.get("text") || !modifiers) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const newCount = countMatches(
      query,
      sourceText.get("text"),
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
    const { selectSource, selectedSource } = this.props;
    if (selectedSource) {
      selectSource(selectedSource.get("id"), {
        line: item.location.start.line
      });
    }
  }

  async onChange(e: any) {
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
      return L10N.getFormatStr(
        `symbolSearch.search.${selectedSymbolType}Placeholder`
      );
    }

    return L10N.getStr("sourceSearch.search.placeholder");
  }

  renderSearchModifiers() {
    const { modifiers, toggleFileSearchModifier, symbolSearchOn } = this.props;

    function searchModBtn(modVal, className, svgName, tooltip) {
      return dom.button(
        {
          className: classnames(className, {
            active: !symbolSearchOn && modifiers && modifiers.get(modVal),
            disabled: symbolSearchOn
          }),
          onClick: () =>
            (!symbolSearchOn ? toggleFileSearchModifier(modVal) : null),
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

SearchBar.propTypes = {
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
    wholeWord: PropTypes.bool.isRequired
  }).isRequired,
  toggleFileSearchModifier: PropTypes.func.isRequired,
  symbolSearchOn: PropTypes.bool.isRequired,
  selectedSymbolType: PropTypes.string,
  toggleSymbolSearch: PropTypes.func.isRequired,
  setSelectedSymbolType: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  setFileSearchQuery: PropTypes.func.isRequired,
  updateSearchResults: PropTypes.func.isRequired
};

SearchBar.displayName = "SearchBar";

SearchBar.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => {
    return {
      searchOn: getFileSearchState(state),
      query: getFileSearchQueryState(state),
      modifiers: getFileSearchModifierState(state),
      symbolSearchOn: getSymbolSearchState(state),
      selectedSymbolType: getSymbolSearchType(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SearchBar);
