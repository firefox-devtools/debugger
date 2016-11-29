const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const Svg = require("./utils/Svg");
const { find, findNext, findPrev, removeOverlay } = require("../utils/source-search");
const classnames = require("classnames");
const { debounce, escapeRegExp } = require("lodash");
const CloseButton = require("./CloseButton");
const { isEnabled } = require("devtools-config");
const ImPropTypes = require("react-immutable-proptypes");

require("./EditorSearchBar.css");

function countMatches(query, text) {
  const re = new RegExp(escapeRegExp(query), "g");
  const match = text.match(re);
  return match ? match.length : 0;
}

const EditorSearchBar = React.createClass({

  propTypes: {
    editor: PropTypes.object,
    sourceText: PropTypes.object,
    selectedSource: ImPropTypes.map
  },

  displayName: "EditorSearchBar",

  getInitialState() {
    return {
      enabled: false,
      query: "",
      count: 0,
      index: 0
    };
  },

  contextTypes: {
    shortcuts: PropTypes.object,
    shouldLoad: PropTypes.object
  },

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    if (isEnabled("editorSearch")) {
      shortcuts.off("CmdOrCtrl+F");
      shortcuts.off("Escape");
      shortcuts.off("CmdOrCtrl+Shift+G");
      shortcuts.off("CmdOrCtrl+G");
    }
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    if (isEnabled("editorSearch")) {
      shortcuts.on("CmdOrCtrl+F", (_, e) => this.toggleSearch(e));
      shortcuts.on("Escape", (_, e) => this.onEscape(e));
      shortcuts.on("CmdOrCtrl+Shift+G", (_, e) => this.traverseResultsPrev(e));
      shortcuts.on("CmdOrCtrl+G", (_, e) => this.traverseResultsNext(e));
    }
  },

  componentDidUpdate(prevProps) {
    const { sourceText, selectedSource } = this.props;

    if (this.searchInput()) {
      this.searchInput().focus();
    }

    if (sourceText && sourceText.get("text") &&
      ((selectedSource != prevProps.selectedSource) ||
      this.shouldLoad)) {
      const query = this.state.query;
      const count = countMatches(query, sourceText.get("text"));
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ count: count, index: 0 });
      this.shouldLoad = false;
      this.search(query);
    } else if (selectedSource != prevProps.selectedSource) {
      this.shouldLoad = true;
    }
  },

  onEscape(e) {
    this.closeSearch(e);
  },

  closeSearch(e) {
    if (this.state.enabled) {
      this.setState({ enabled: false });
      const ed = this.props.editor;
      const ctx = { ed, cm: ed.codeMirror };
      removeOverlay(ctx);
      e.stopPropagation();
      e.preventDefault();
    }
  },

  toggleSearch(e) {
    e.stopPropagation();
    e.preventDefault();

    this.setState({ enabled: !this.state.enabled });

    if (this.state.enabled) {
      const selection = this.props.editor.codeMirror.getSelection();
      this.setSearchValue(selection);
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

  onChange(e) {
    const sourceText = this.props.sourceText;
    const query = e.target.value;
    const count = countMatches(query, sourceText.get("text"));
    this.setState({ query, count, index: 0 });
    this.search(query);
  },

  traverseResultsPrev(e) {
    e.stopPropagation();
    e.preventDefault();

    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };
    const { query, index, count } = this.state;

    if (query == "") {
      this.setState({ enabled: true });
    }

    findPrev(ctx, query);
    const nextIndex = index == 0 ? count - 1 : index - 1;
    this.setState({ index: nextIndex });
  },

  traverseResultsNext(e) {
    e.stopPropagation();
    e.preventDefault();

    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };
    const { query, index, count } = this.state;

    if (query == "") {
      this.setState({ enabled: true });
    }

    findNext(ctx, query);
    const nextIndex = index == count - 1 ? 0 : index + 1;
    this.setState({ index: nextIndex });
  },

  onKeyUp(e) {
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

    if (!sourceText.get("text")) {
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

module.exports = EditorSearchBar;
