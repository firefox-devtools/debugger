const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const Svg = require("./utils/Svg");
const { find, findNext, findPrev } = require("../utils/source-search");
const classnames = require("classnames");
const { debounce, escapeRegExp } = require("lodash");
const CloseButton = require("./CloseButton");

require("./EditorSearchBar.css");

function countMatches(query, text) {
  const re = new RegExp(escapeRegExp(query), "g");
  const match = text.match(re);
  return match ? match.length : 0;
}

const EditorSearchBar = React.createClass({

  propTypes: {
    editor: PropTypes.object,
    sourceText: PropTypes.object
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
    shortcuts: PropTypes.object
  },

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("CmdOrCtrl+F", this.toggleSearch);
    shortcuts.off("Escape", this.onEscape);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("CmdOrCtrl+F", this.toggleSearch);
    shortcuts.on("Escape", this.onEscape);
  },

  componentWillReceiveProps() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("CmdOrCtrl+Shift+G", (_, e) => this.traverseResultsPrev(e));
    shortcuts.on("CmdOrCtrl+G", (_, e) => this.traverseResultsNext(e));
  },

  componentDidUpdate() {
    if (this.searchInput()) {
      this.searchInput().focus();
    }
  },

  onEscape(shortcut, e) {
    this.closeSearch(e);
  },

  closeSearch(e) {
    if (this.state.enabled) {
      this.setState({ enabled: false });
      e.stopPropagation();
      e.preventDefault();
    }
  },

  toggleSearch(shortcut, e) {
    e.stopPropagation();
    e.preventDefault();

    this.setState({ enabled: !this.state.enabled });

    if (this.state.enabled) {
      const node = this.searchInput();
      if (node) {
        node.setSelectionRange(0, node.value.length);
      }
    }
  },

  searchInput() {
    return findDOMNode(this).querySelector("input");
  },

  onChange(e) {
    const query = e.target.value;

    const count = countMatches(query, this.props.sourceText.get("text"));
    this.setState({ query, count, index: 0 });

    this.search(query);
  },

  traverseResultsPrev(e) {
    e.stopPropagation();
    e.preventDefault();

    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };
    const { query, index, count } = this.state;

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
