const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSources, getSelectedSource } = require("../selectors");

const { KeyShortcuts } = require("devtools-sham-modules");
const shortcuts = new KeyShortcuts({ window });
const { formatKeyShortcut } = require("../utils/text");
const { isEnabled } = require("devtools-config");

const verticalLayoutBreakpoint = window.matchMedia("(min-width: 700px)");

require("./App.css");
require("./menu.css");
require("./SplitBox.css");
require("./reps.css");
let { SplitBox } = require("devtools-modules");
SplitBox = createFactory(SplitBox);

const SourceSearch = createFactory(require("./SourceSearch"));
const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectSource: PropTypes.func,
    selectedSource: PropTypes.object,
  },

  displayName: "App",

  getChildContext() {
    return { shortcuts };
  },

  renderWelcomeBox() {
    return dom.div(
      { className: "welcomebox" },
      L10N.getFormatStr("welcome.search", formatKeyShortcut("CmdOrCtrl+P"))
    );
  },

  renderCenterPane() {
    return dom.div(
      { className: "center-pane" },
      dom.div(
        { className: "editor-container" },
        SourceTabs({
          togglePane: this.togglePane,
          startPanelCollapsed: this.state.startPanelCollapsed,
          endPanelCollapsed: this.state.endPanelCollapsed,
        }),
        Editor(),
        !this.props.selectedSource ? this.renderWelcomeBox() : null,
        SourceSearch()
      )
    );
  },

  getInitialState() {
    const vertical = isEnabled("verticalLayout")
      ? verticalLayoutBreakpoint.matches : true;

    return {
      vertical,
      startPanelCollapsed: false,
      endPanelCollapsed: false,
    };
  },

  componentDidMount() {
    if (isEnabled("verticalLayout")) {
      verticalLayoutBreakpoint.addListener(this.onLayoutChange);
    }
  },

  componentWillUnmount() {
    verticalLayoutBreakpoint.removeListener(this.onLayoutChange);
  },

  onLayoutChange() {
    this.setState({
      vertical: verticalLayoutBreakpoint.matches
    });
  },

  togglePane(position) {
    if (position === "start") {
      this.setState({
        startPanelCollapsed: !this.state.startPanelCollapsed,
      });
    } else if (position === "end") {
      this.setState({
        endPanelCollapsed: !this.state.endPanelCollapsed,
      });
    }
  },

  render: function() {
    return dom.div(
      { className: "debugger" },
      SplitBox({
        style: { width: "100vw" },
        initialSize: "300px",
        minSize: 10,
        maxSize: "50%",
        splitterSize: 1,
        startPanel: Sources({ sources: this.props.sources }),
        startPanelCollapsed: this.state.startPanelCollapsed,
        endPanel: SplitBox({
          initialSize: "300px",
          minSize: 10,
          maxSize: "80%",
          splitterSize: 1,
          endPanelControl: true,
          startPanel: this.renderCenterPane(this.props),
          endPanel: RightSidebar(),
          endPanelCollapsed: this.state.endPanelCollapsed,
          vert: this.state.vertical
        }),
      })
    );
  }
});

App.childContextTypes = {
  shortcuts: PropTypes.object
};

module.exports = connect(
  state => ({ sources: getSources(state),
    selectedSource: getSelectedSource(state),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
