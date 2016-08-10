const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");

require("./App.css");
require("../lib/variables.css");
require("../lib/themes/light-theme.css");
const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const SplitBox = createFactory(require("./SplitBox"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));
const SourceFooter = createFactory(require("./SourceFooter"));
const Autocomplete = createFactory(require("./Autocomplete"));
const { getSelectedSource, getSources } = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const { KeyShortcuts } = require("../lib/devtools-sham/client/shared/key-shortcuts");

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    selectSource: PropTypes.func
  },

  displayName: "App",

  getInitialState() {
    return {
      searchOn: true
    };
  },

  componentDidMount() {
    this.shortcuts = new KeyShortcuts({ window });
    this.shortcuts.on("Cmd+P", this.toggleSourcesSearch);
    window.addEventListener("keydown", this.onKeyDown);
  },

  componentWillUnmount() {
    this.shortcuts.off("Cmd+P", this.toggleSourcesSearch);
    window.removeEventListener("keydown", this.onKeyDown);
  },

  toggleSourcesSearch(key, e) {
    e.preventDefault();
    this.setState({ searchOn: !this.state.searchOn });
  },

  onKeyDown(e) {
    if (e.key === "Escape") {
      this.setState({ searchOn: false });
      e.preventDefault();
    }
  },

  renderSourcesSearch() {
    function getSourcePath(source) {
      const url = source.get("url") || "";
      const path = (new URL(url)).pathname;
      return endTruncateStr(path, 50);
    }

    function searchResults(sources) {
      return sources.valueSeq()
        .filter(source => !!source.get("url"))
        .map(source => ({
          value: getSourcePath(source),
          title: getSourcePath(source).split("/").pop(),
          subtitle: getSourcePath(source),
          id: source.get("id")
        }))
        .toJS();
    }

    return Autocomplete({
      selectItem: result => {
        this.props.selectSource(result.id);
        this.setState({ searchOn: false });
      },
      items: searchResults(this.props.sources)
    });
  },

  renderEditor() {
    return dom.div(
      { className: "editor-container" },
      SourceTabs(),
      Editor(),
      SourceFooter()
    );
  },

  renderCenterPane() {
    let centerPane;
    if (this.state.searchOn) {
      centerPane = this.renderSourcesSearch();
    } else if (this.props.selectedSource) {
      centerPane = this.renderEditor();
    }

    return dom.div({ className: "center-pane" },
      centerPane);
  },

  render: function() {
    return dom.div({ className: "theme-light debugger" },
      SplitBox({
        initialWidth: 300,
        left: Sources({ sources: this.props.sources }),
        right: SplitBox({
          initialWidth: 300,
          rightFlex: true,
          left: this.renderCenterPane(this.props),
          right: RightSidebar()
        })
      })
    );
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              selectedSource: getSelectedSource(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
