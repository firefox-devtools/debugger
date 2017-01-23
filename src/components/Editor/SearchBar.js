// @flow

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const Svg = require("../shared/Svg");
const { find, findNext, findPrev, removeOverlay } = require("../../utils/source-search");
const classnames = require("classnames");
const escapeRegExp = require("lodash/escapeRegExp");
const debounce = require("lodash/debounce");
const CloseButton = require("../shared/Button/Close");
const ImPropTypes = require("react-immutable-proptypes");

require("./SearchBar.css");

function countMatches(query, text) {
  const re = new RegExp(escapeRegExp(query), "g");
  const match = text.match(re);
  return match ? match.length : 0;
}

const SearchBar = React.createClass({

  propTypes: {
    editor: PropTypes.object,
    sourceText: ImPropTypes.map,
    selectedSource: ImPropTypes.map
  },

  displayName: "SearchBar",

  getInitialState() {
    return {
      enabled: false,
      query: "",
      count: 0,
      index: 0
    };
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    shortcuts.off(`CmdOrCtrl+${L10N.getStr("sourceSearch.search.key")}`);
    shortcuts.off("Escape");
    shortcuts.off(`CmdOrCtrl+Shift+${searchAgainKey}`);
    shortcuts.off(`CmdOrCtrl+${searchAgainKey}`);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const searchAgainKey = L10N.getStr("sourceSearch.search.again.key");
    shortcuts.on(`CmdOrCtrl+${L10N.getStr("sourceSearch.search.key")}`,
      (_, e) => this.toggleSearch(e));
    shortcuts.on("Escape", (_, e) => this.onEscape(e));
    shortcuts.on(`CmdOrCtrl+Shift+${searchAgainKey}`,
      (_, e) => this.traverseResultsPrev(e));
    shortcuts.on(`CmdOrCtrl+${searchAgainKey}`,
      (_, e) => this.traverseResultsNext(e));
  },

  componentDidUpdate(prevProps: any) {
    const { sourceText, selectedSource } = this.props;

    if (this.searchInput()) {
      this.searchInput().focus();
    }

    const hasLoaded = sourceText && !sourceText.get("loading");
    const wasLoading = prevProps.sourceText
                        && prevProps.sourceText.get("loading");

    const doneLoading = wasLoading && hasLoaded;
    const changedFiles = selectedSource != prevProps.selectedSource
                          && hasLoaded;

    if (doneLoading || changedFiles) {
      this.doSearch(this.state.query);
    }
  },

  onEscape(e: SyntheticKeyboardEvent) {
    this.closeSearch(e);
  },

  closeSearch(e: SyntheticEvent) {
    const ed = this.props.editor;

    if (this.state.enabled && ed) {
      this.setState({ enabled: false });
      const ctx = { ed, cm: ed.codeMirror };
      removeOverlay(ctx);
      e.stopPropagation();
      e.preventDefault();
    }
  },

  toggleSearch(e: SyntheticKeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    const { editor } = this.props;

    this.setState({ enabled: !this.state.enabled });

    if (this.state.enabled && editor) {
      const selection = editor.codeMirror.getSelection();
      this.setSearchValue(selection);
      this.doSearch(selection);
      this.selectSearchInput();
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
    const sourceText = this.props.sourceText;
    if (!sourceText) {
      return;
    }

    const count = countMatches(query, sourceText.get("text"));
    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({ query, count, index: 0 });
    this.search(query);
  },

  onChange(e: any) {
    return this.doSearch(e.target.value);
  },

  traverseResultsPrev(e: SyntheticKeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();

    const ed = this.props.editor;

    if (!ed) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };
    const { query, index, count } = this.state;

    if (query == "") {
      this.setState({ enabled: true });
    }

    findPrev(ctx, query);
    const nextIndex = index == 0 ? count - 1 : index - 1;
    this.setState({ index: nextIndex });
  },

  traverseResultsNext(e: SyntheticEvent) {
    e.stopPropagation();
    e.preventDefault();

    const ed = this.props.editor;

    if (!ed) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };
    const { query, index, count } = this.state;

    if (query == "") {
      this.setState({ enabled: true });
    }

    findNext(ctx, query);
    const nextIndex = index == count - 1 ? 0 : index + 1;
    this.setState({ index: nextIndex });
  },

  onKeyUp(e: SyntheticKeyboardEvent) {
    if (e.key != "Enter") {
      return;
    }

    if (e.shiftKey) {
      this.traverseResultsPrev(e);
    } else {
      this.traverseResultsNext(e);
    }
  },

  search: debounce(function(query) {
    const sourceText = this.props.sourceText;

    if (!sourceText || !sourceText.get("text")) {
      return;
    }

    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };

    find(ctx, query);
  }, 100),

  renderSummary() {
    const { count, index, query } = this.state;

    if (query.trim() == "") {
      return dom.div({});
    } else if (count == 0) {
      return dom.div(
        { className: "summary" },
        L10N.getStr("editor.noResults")
      );
    }

    return dom.div(
      { className: "summary" },
      L10N.getFormatStr("editor.searchResults", index + 1, count)
    );
  },

  renderSvg() {
    const { count, query } = this.state;

    if (count == 0 && query.trim() != "") {
      return Svg("sad-face");
    }

    return Svg("magnifying-glass");
  },

  render() {
    if (!this.state.enabled) {
      return dom.div();
    }

    const { count, query } = this.state;

    return dom.div(
      { className: "search-bar" },
      this.renderSvg(),
      dom.input({
        className: classnames({
          empty: count == 0 && query.trim() != ""
        }),
        onChange: this.onChange,
        onKeyUp: this.onKeyUp,
        placeholder: "Search in file...",
        value: this.state.query,
        spellCheck: false
      }),
      this.renderSummary(),
      CloseButton({
        handleClick: this.closeSearch,
        buttonClass: "big"
      })
    );
  }
});

module.exports = SearchBar;
