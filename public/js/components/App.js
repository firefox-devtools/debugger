const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { Services } = require("Services");
const classnames = require("classnames");
const actions = require("../actions");
const { isFirefoxPanel } = require("../feature");

require("./App.css");

// Using this static variable allows webpack to know at compile-time
// to avoid this require and not include it at all in the output.
if (process.env.TARGET !== "firefox-panel") {
  require("../lib/themes/light-theme.css");
}

const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const SplitBox = createFactory(require("./SplitBox"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));
const SourceFooter = createFactory(require("./SourceFooter"));
const Svg = require("./utils/Svg");
const Autocomplete = createFactory(require("./Autocomplete"));
const {
  getSources,
  getSelectedSource,
  getSidebarsState
} = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const { KeyShortcuts } = require("../lib/devtools-sham/client/shared/key-shortcuts");
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
    resizeSidebar: PropTypes.func,
    selectedSource: PropTypes.object,
    sidebars: PropTypes.object
  },

  displayName: "App",

  getInitialState() {
    return {
      searchOn: false
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
    if (e.key === "Escape") {
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
    const modifierTxt = Services.appinfo.OS === "Darwin" ? "Cmd" : "Ctrl";
    return dom.div(
      { className: "welcomebox" },
      `Want to find a file? (${modifierTxt} + P)`
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
        this.state.searchOn ? this.renderSourcesSearch() : null,
        SourceFooter()
      )
    );
  },

  render: function() {
    return dom.div(
      { className: classnames("debugger theme-body",
                              { "theme-light": !isFirefoxPanel() }) },
      SplitBox({
        width: this.props.sidebars.toJS().left.width,
        resizeSidebar: this.props.resizeSidebar.bind(null, "left"),
        left: Sources({ sources: this.props.sources }),
        right: SplitBox({
          width: this.props.sidebars.toJS().right.width,
          resizeSidebar: this.props.resizeSidebar.bind(null, "right"),
          rightFlex: true,
          left: this.renderCenterPane(this.props),
          right: RightSidebar({ keyShortcuts: this.shortcuts })
        })
      })
    );
  }
});

module.exports = connect(
  state => ({ sources: getSources(state),
              selectedSource: getSelectedSource(state),
              sidebars: getSidebarsState(state)
             }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
