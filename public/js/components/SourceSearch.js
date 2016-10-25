const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSources, getSelectedSource } = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const { parse: parseURL } = require("url");

require("./SourceSearch.css");

const Autocomplete = createFactory(require("./Autocomplete"));

function searchResults(sources) {
  function getSourcePath(source) {
    const { path } = parseURL(source.get("url"));
    return endTruncateStr(path, 50);
  }

  return sources.valueSeq()
    .filter(source => source.get("url"))
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
    selectedSource: PropTypes.object
  },

  contextTypes: {
    shortcuts: PropTypes.object
  },

  displayName: "Search",

  getInitialState() {
    return {
      searchOn: false
    };
  },

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
    this.setState({ searchOn: !this.state.searchOn });
  },

  onEscape(shortcut, e) {
    if (this.state.searchOn) {
      e.preventDefault();
      this.setState({ searchOn: false });
    }
  },

  close() {
    this.setState({ searchOn: false });
  },

  render() {
    return this.state.searchOn ?
      dom.div({ className: "search-container" },
      Autocomplete({
        selectItem: result => {
          this.props.selectSource(result.id);
          this.setState({ searchOn: false });
        },
        handleClose: this.close,
        items: searchResults(this.props.sources)
      })) : null;
  }

});

module.exports = connect(
  state => ({ sources: getSources(state),
              selectedSource: getSelectedSource(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Search);
