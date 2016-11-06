const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const {
  getSources,
  getSelectedSource,
  getFileSearchState,
  getFileSearchPreviousInput
} = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const { parse: parseURL } = require("url");
const { isPretty } = require("../utils/source");

require("./SourceSearch.css");

const Autocomplete = createFactory(require("./Autocomplete"));

function searchResults(sources) {
  function getSourcePath(source) {
    const { path, href } = parseURL(source.get("url"));
    // for URLs like "about:home" the path is null so we pass the full href
    return endTruncateStr((path || href), 50);
  }

  return sources.valueSeq()
    .filter(source => !isPretty(source.toJS()) && source.get("url"))
    .map(source => ({
      value: getSourcePath(source),
      title: getSourcePath(source).split("/").pop(),
      subtitle: getSourcePath(source),
      id: source.get("id")
    }))
    .toJS();
}

const Search = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectSource: PropTypes.func,
    selectedSource: PropTypes.object,
    toggleFileSearch: PropTypes.func,
    searchOn: PropTypes.bool,
    previousInput: PropTypes.string,
    saveFileSearchInput: PropTypes.func
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  displayName: "Search",

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("CmdOrCtrl+P", this.toggle);
    shortcuts.off("Escape", this.onEscape);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("CmdOrCtrl+P", this.toggle);
    shortcuts.on("Escape", this.onEscape);
  },

  toggle(key, e) {
    e.preventDefault();
    this.props.toggleFileSearch(!this.props.searchOn);
  },

  onEscape(shortcut, e) {
    if (this.props.searchOn) {
      e.preventDefault();
      this.props.toggleFileSearch(false);
    }
  },

  close(previousInput = "") {
    this.props.saveFileSearchInput(previousInput);
    this.props.toggleFileSearch(false);
  },

  render() {
    return this.props.searchOn ?
      dom.div({ className: "search-container" },
      Autocomplete({
        selectItem: result => {
          this.props.selectSource(result.id);
          this.props.saveFileSearchInput("");
          this.props.toggleFileSearch(false);
        },
        handleClose: this.close,
        items: searchResults(this.props.sources),
        previousInput: this.props.previousInput
      })) : null;
  }

});

module.exports = connect(
  state => ({
    sources: getSources(state),
    selectedSource: getSelectedSource(state),
    searchOn: getFileSearchState(state),
    previousInput: getFileSearchPreviousInput(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Search);
