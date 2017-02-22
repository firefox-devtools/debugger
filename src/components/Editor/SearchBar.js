// @flow

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const { isEnabled } = require("devtools-config");
const Svg = require("../shared/Svg");
const {
  find,
  findNext,
  findPrev,
  removeOverlay,
  countMatches
} = require("../../utils/editor");
const classnames = require("classnames");
const debounce = require("lodash/debounce");
const CloseButton = require("../shared/Button/Close");
const ImPropTypes = require("react-immutable-proptypes");

require("./SearchBar.css");

const SearchBar = React.createClass({

  propTypes: {
    editor: PropTypes.object,
    sourceText: ImPropTypes.map,
    selectedSource: ImPropTypes.map,
    modifiers: PropTypes.object.isRequired,
    toggleModifier: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
    updateQuery: PropTypes.func.isRequired
  },

  displayName: "SearchBar",

  getInitialState() {
    return {
      enabled: false,
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
      (_, e) => this.traverseResults(e, true));
    shortcuts.on(`CmdOrCtrl+${searchAgainKey}`,
      (_, e) => this.traverseResults(e, false));
  },

  componentDidUpdate(prevProps: any) {
    const { sourceText, selectedSource, query, modifiers } = this.props;

    if (this.searchInput()) {
      this.searchInput().focus();
    }

    const hasLoaded = sourceText && !sourceText.get("loading");
    const wasLoading = prevProps.sourceText
                        && prevProps.sourceText.get("loading");

    const doneLoading = wasLoading && hasLoaded;
    const changedFiles = selectedSource != prevProps.selectedSource
                          && hasLoaded;
    const modifiersUpdated = modifiers != prevProps.modifiers;

    if (doneLoading || changedFiles || modifiersUpdated) {
      this.doSearch(query);
    }
  },

  onEscape(e: SyntheticKeyboardEvent) {
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
    } = this.props;
    if (!sourceText || !sourceText.get("text")) {
      return;
    }

    updateQuery(query);

    if (!ed) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const count = countMatches(query, sourceText.get("text"), modifiers);
    const index = find(ctx, query, true, modifiers);

    debounce(() => this.setState({ count, index }), 100)();
  },

  onChange(e: any) {
    return this.doSearch(e.target.value);
  },

  traverseResults(e: SyntheticEvent, rev: boolean) {
    e.stopPropagation();
    e.preventDefault();

    const ed = this.props.editor;

    if (!ed) {
      return;
    }

    const ctx = { ed, cm: ed.codeMirror };

    const { query, modifiers } = this.props;

    if (query === "") {
      this.setState({ enabled: true });
    }

    const findFnc = rev ? findPrev : findNext;

    const nextIndex = findFnc(ctx, query, true, modifiers);
    this.setState({ index: nextIndex });
  },

  onKeyUp(e: SyntheticKeyboardEvent) {
    if (e.key != "Enter") {
      return;
    }

    this.traverseResults(e, e.shiftKey);
  },

  renderSummary() {
    const { count, index } = this.state;

    if (this.props.query.trim() == "") {
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
    const { count } = this.state;

    if (count == 0 && this.props.query.trim() != "") {
      return Svg("sad-face");
    }

    return Svg("magnifying-glass");
  },

  renderSearchModifiers() {
    const {
      modifiers: { caseSensitive, wholeWord, regexMatch },
      toggleModifier } = this.props;

    if (!isEnabled("searchModifiers")) {
      return;
    }

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

  render() {
    if (!this.state.enabled) {
      return dom.div();
    }

    const { count } = this.state;

    return dom.div(
      { className: "search-bar" },
      this.renderSearchModifiers(),
      this.renderSvg(),
      dom.input({
        className: classnames({
          empty: count == 0 && this.props.query.trim() != ""
        }),
        onChange: this.onChange,
        onKeyUp: this.onKeyUp,
        placeholder: "Search in file...",
        value: this.props.query,
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
