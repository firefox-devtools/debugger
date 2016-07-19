const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");

require("./App.css");
require("../lib/variables.css");
const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const SplitBox = createFactory(require("./SplitBox"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));
const SourceFooter = createFactory(require("./SourceFooter"));
const Autocomplete = createFactory(require("./Autocomplete"));
const { getSelectedSource, getSources, getBreakpoints } = require("../selectors");
const { endTruncateStr } = require("../util/utils");
const { DevTools } = require("../util/create-store");
const { isEnabled } = require("../../../config/feature");

function DevToolsPanel() {
  if (isEnabled("redux-devtools.enabled")) {
    return React.createElement(DevTools);
  }

  return () => {};
}

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectedSource: PropTypes.object,
    selectSource: PropTypes.func,
    breakpoints: PropTypes.object
  },

  displayName: "App",

  getInitialState() {
    return {
      searchOn: false
    };
  },

  componentDidMount() {
    window.addEventListener("keydown", this.toggleSourcesSearch, false);
  },

  componentWillUnmount() {
    window.removeEventListener("keydown", this.toggleSourcesSearch, false);
  },

  toggleSourcesSearch(e) {
    if ((e.metaKey || e.ctrlKey) && e.key == "p") {
      this.setState({ searchOn: !this.state.searchOn });
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

  renderWelcomeBox() {
    return dom.div(
      { className: "welcomebox" },
      "Want to find a file? (Cmd + P)"
    );
  },

  renderCenterPane() {
    let centerPane;
    if (this.state.searchOn) {
      centerPane = this.renderSourcesSearch();
    } else if (this.props.selectedSource) {
      centerPane = this.renderEditor();
    } else {
      centerPane = this.renderWelcomeBox();
    }

    return dom.div({ className: "center-pane" }, centerPane);
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
      }),
      DevToolsPanel()
    );
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              breakpoints: getBreakpoints(state),
              selectedSource: getSelectedSource(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
