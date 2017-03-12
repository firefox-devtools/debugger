// @flow
const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const {
  getSources,
  getSelectedSource,
  getFileSearchState
} = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const { parse: parseURL } = require("url");
const { isPretty } = require("../utils/source");

require("./SourceSearch.css");

const Autocomplete = createFactory(require("./shared/Autocomplete"));

function searchResults(sources) {
  function getSourcePath(source) {
    const { path, href } = parseURL(source.get("url"));
    // for URLs like "about:home" the path is null so we pass the full href
    return (path || href);
  }

  return sources.valueSeq()
    .filter(source => !isPretty(source.toJS()) && source.get("url"))
    .map(source => ({
      value: getSourcePath(source),
      title: getSourcePath(source).split("/").pop(),
      subtitle: endTruncateStr(getSourcePath(source), 100),
      id: source.get("id")
    }))
    .toJS();
}

const Search = React.createClass({
  propTypes: {
    sources: PropTypes.object.isRequired,
    selectSource: PropTypes.func.isRequired,
    selectedSource: PropTypes.object,
    toggleFileSearch: PropTypes.func.isRequired,
    closeFileSearch: PropTypes.func.isRequired,
    searchOn: PropTypes.bool
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  displayName: "Search",

  getInitialState() {
    return {
      inputValue: ""
    };
  },

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    const searchKeys = [
      L10N.getStr("sources.search.key"),
      L10N.getStr("sources.searchAlt.key")
    ];
    searchKeys.forEach(key => shortcuts.off(`CmdOrCtrl+${key}`, this.toggle));
    shortcuts.off("Escape", this.onEscape);
  },

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    const searchKeys = [
      L10N.getStr("sources.search.key"),
      L10N.getStr("sources.searchAlt.key")
    ];
    searchKeys.forEach(key => shortcuts.on(`CmdOrCtrl+${key}`, this.toggle));
    shortcuts.on("Escape", this.onEscape);
  },

  toggle(key, e) {
    e.preventDefault();
    this.props.toggleFileSearch();
  },

  onEscape(shortcut, e) {
    if (this.props.searchOn) {
      e.preventDefault();
      this.setState({ inputValue: "" });
      this.props.closeFileSearch();
    }
  },

  close(inputValue = "") {
    this.setState({ inputValue });
    this.props.closeFileSearch();
  },

  render() {
    if (!this.props.searchOn) {
      return null;
    }

    return dom.div({ className: "search-container" },
      Autocomplete({
        selectItem: result => {
          this.props.selectSource(result.id);
          this.close();
        },
        close: this.close,
        items: searchResults(this.props.sources),
        inputValue: this.state.inputValue,
        placeholder: L10N.getStr("sourceSearch.search"),
        size: "big"
      }));
  }

});

module.exports = connect(
  state => ({
    sources: getSources(state),
    selectedSource: getSelectedSource(state),
    searchOn: getFileSearchState(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Search);
