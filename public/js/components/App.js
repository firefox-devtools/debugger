const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { cmdString } = require("../utils/text");
const classnames = require("classnames");
const actions = require("../actions");
const { isFirefoxPanel } = require("../feature");

const { KeyShortcuts } = require("devtools-sham/client/shared/key-shortcuts");

require("./App.css");
require("devtools/client/shared/components/splitter/SplitBox.css");

// Using this static variable allows webpack to know at compile-time
// to avoid this require and not include it at all in the output.
if (process.env.TARGET !== "firefox-panel") {
  require("../lib/themes/light-theme.css");
}

const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const SplitBox = createFactory(
  require("devtools/client/shared/components/splitter/SplitBox"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));
const Svg = require("./utils/Svg");
const Autocomplete = createFactory(require("./Autocomplete"));
const { getSources, getSelectedSource } = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const { isHiddenSource, getURL } = require("../utils/sources-tree");

function searchResults(sources) {
  function getSourcePath(source) {
    const { path } = getURL(source);
    return endTruncateStr(path, 50);
  }

  return sources.valueSeq()
    .filter(source => !isHiddenSource(source))
    .map(source => ({
      value: getSourcePath(source),
      title: getSourcePath(source).split("/").pop(),
      subtitle: getSourcePath(source),
      id: source.get("id")
    }))
    .toJS();
}

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectSource: PropTypes.func,
    selectedSource: PropTypes.object
  },

  displayName: "App",

  getInitialState() {
    return {
      searchOn: false
    };
  },

  getChildContext() {
    return {
      shortcuts: this.shortcuts
    };
  },

  componentDidMount() {
    this.shortcuts = new KeyShortcuts({ window });

    this.shortcuts.on("CmdOrCtrl+P", this.toggleSourcesSearch);
    window.addEventListener("keydown", this.onKeyDown);
  },

  componentWillUnmount() {
    this.shortcuts.off("CmdOrCtrl+P", this.toggleSourcesSearch);
    window.removeEventListener("keydown", this.onKeyDown);
  },

  toggleSourcesSearch(key, e) {
    e.preventDefault();
    this.setState({ searchOn: !this.state.searchOn });
  },

  onKeyDown(e) {
    if (this.state.searchOn && e.key === "Escape") {
      this.setState({ searchOn: false });
      e.preventDefault();
    }
  },

  closeSourcesSearch() {
    this.setState({ searchOn: false });
  },

  renderSourcesSearch() {
    return dom.div({ className: "search-container" },
      Autocomplete({
        selectItem: result => {
          this.props.selectSource(result.id);
          this.setState({ searchOn: false });
        },
        items: searchResults(this.props.sources)
      }),
      dom.div({ className: "close-button" },
      Svg("close", { onClick: this.closeSourcesSearch }))
    );
  },

  renderWelcomeBox() {
    return dom.div(
      { className: "welcomebox" },
      `${cmdString()}+P to search for files`
    );
  },

  renderCenterPane() {
    return dom.div(
      { className: "center-pane" },
      dom.div(
        { className: "editor-container" },
        SourceTabs(),
        Editor(),
        !this.props.selectedSource ? this.renderWelcomeBox() : null,
        this.state.searchOn ? this.renderSourcesSearch() : null
      )
    );
  },

  render: function() {
    return dom.div(
      { className: classnames("debugger theme-body",
                              { "theme-light": !isFirefoxPanel() }) },
      SplitBox({
        style: { width: "100vh" },
        initialSize: "33%",
        minSize: 10,
        maxSize: "50%",
        splitterSize: 1,
        startPanel: Sources({ sources: this.props.sources }),
        endPanel: SplitBox({
          initialSize: "50%",
          minSize: 10,
          maxSize: "80%",
          splitterSize: 1,
          endPanelControl: true,
          startPanel: this.renderCenterPane(this.props),
          endPanel: RightSidebar()
        })
      })
    );
  }
});

App.childContextTypes = {
  shortcuts: PropTypes.object
};

module.exports = connect(
  state => ({ sources: getSources(state),
              selectedSource: getSelectedSource(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
