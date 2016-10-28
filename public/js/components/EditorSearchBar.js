const React = require("react");
const { DOM: dom, PropTypes } = React;
const { findDOMNode } = require("react-dom");
const Svg = require("./utils/Svg");
const { isEnabled } = require("devtools-config");
const { find, findNext, findPrev } = require("../utils/source-search");
const classnames = require("classnames");

require("./EditorSearchBar.css");

function countMatches(query, text) {
  const re = new RegExp(query, "g");
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
    if (isEnabled("search")) {
      shortcuts.off("CmdOrCtrl+F", this.toggleSearch);
      shortcuts.off("Escape", this.onEscape);
    }
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    if (isEnabled("search")) {
      shortcuts.on("CmdOrCtrl+F", this.toggleSearch);
      shortcuts.on("Escape", this.onEscape);
    }
  },

  componentDidUpdate() {
    if (this.searchInput()) {
      this.searchInput().focus();
    }
  },

  onEscape(shortcut, e) {
    if (this.state.enabled) {
      this.setState({ enabled: false });
      e.preventDefault();
    }
  },

  toggleSearch(shortcut, e) {
    e.stopPropagation();
    e.preventDefault();

    this.setState({ enabled: !this.state.enabled });

    if (this.state.enabled) {
      const node = this.searchInput();
      node.setSelectionRange(0, node.value.length);
    }
  },

  searchInput() {
    return findDOMNode(this).querySelector("input");
  },

  onChange(e) {
    const query = e.target.value;
    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };

    find(ctx, query);
    const count = countMatches(query, this.props.sourceText.get("text"));
    this.setState({ query, count, index: 0 });
  },

  onKeyUp(e) {
    const ed = this.props.editor;
    const ctx = { ed, cm: ed.codeMirror };
    const { query, index, count } = this.state;

    if (e.key != "Enter") {
      return;
    }

    if (e.shiftKey) {
      findPrev(ctx, query);
      const nextIndex = index == 0 ? count - 1 : index - 1;
      this.setState({ index: nextIndex });
    } else {
      findNext(ctx, query);
      const nextIndex = index == count - 1 ? 0 : index + 1;
      this.setState({ index: nextIndex });
    }
  },

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
    if (!isEnabled("search") || !this.state.enabled) {
      return dom.div();
    }

    const { count } = this.state;

    return dom.div(
      { className: "search-bar" },
      this.renderSvg(),
      dom.input({
        className: classnames({
          empty: count == 0
        }),
        onChange: this.onChange,
        onKeyUp: this.onKeyUp,
        placeholder: "Search in file...",
        value: this.state.query,
        spellCheck: false
      }),
      this.renderSummary()
    );
  }
});

module.exports = EditorSearchBar;
