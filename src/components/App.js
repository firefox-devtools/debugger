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
const InformationPanes = createFactory(require("./InformationPanes"));
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

  componentDidMount() {
    if (isEnabled("verticalLayout")) {
      verticalLayoutBreakpoint.addListener(this.onLayoutChange);
    }
  },

  componentWillUnmount() {
    verticalLayoutBreakpoint.removeListener(this.onLayoutChange);
  },

  getInitialState() {
    const horizontal = isEnabled("verticalLayout")
      ? verticalLayoutBreakpoint.matches : true;

    return {
      horizontal,
      startPanelCollapsed: false,
      endPanelCollapsed: false,
    };
  },

  onLayoutChange() {
    this.setState({
      horizontal: verticalLayoutBreakpoint.matches
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

  renderWelcomeBox() {
    return dom.div(
      { className: "welcomebox" },
      L10N.getFormatStr("welcome.search",
        formatKeyShortcut(`CmdOrCtrl+${L10N.getStr("sources.search.key")}`))
    );
  },

  renderEditorPane() {
    const { startPanelCollapsed, endPanelCollapsed, horizontal } = this.state;
    return dom.div(
      { className: "editor-pane" },
      dom.div(
        { className: "editor-container" },
        SourceTabs({
          togglePane: this.togglePane,
          startPanelCollapsed,
          endPanelCollapsed,
          horizontal
        }),
        Editor(),
        !this.props.selectedSource ? this.renderWelcomeBox() : null,
        SourceSearch()
      )
    );
  },

  renderHorizontalLayout() {
    const { sources } = this.props;
    const { startPanelCollapsed, endPanelCollapsed, horizontal } = this.state;

    return dom.div(
      { className: "debugger" },
      SplitBox({
        style: { width: "100vw" },
        initialSize: "300px",
        minSize: 10,
        maxSize: "50%",
        splitterSize: 1,
        startPanel: Sources({ sources, horizontal }),
        startPanelCollapsed,
        endPanel: SplitBox({
          initialSize: "300px",
          minSize: 10,
          maxSize: "80%",
          splitterSize: 1,
          endPanelControl: true,
          startPanel: this.renderEditorPane(),
          endPanel: InformationPanes({ horizontal }),
          endPanelCollapsed,
          vert: horizontal
        }),
      }));
  },

  renderVerticalLayout() {
    const { sources } = this.props;
    const { startPanelCollapsed, endPanelCollapsed, horizontal } = this.state;

    return dom.div(
      { className: "debugger" },
      SplitBox({
        style: { width: "100vw" },
        initialSize: "300px",
        minSize: 30,
        maxSize: "95%",
        splitterSize: 1,
        vert: horizontal,
        startPanel: SplitBox({
          style: { width: "100vw" },
          initialSize: "150px",
          minSize: 10,
          maxSize: "40%",
          splitterSize: 1,
          startPanelCollapsed,
          startPanel: Sources({ sources, horizontal }),
          endPanel: this.renderEditorPane(),
        }),
        endPanel: InformationPanes({ horizontal }),
        endPanelCollapsed,
      }));
  },

  render() {
    return this.state.horizontal ?
      this.renderHorizontalLayout() : this.renderVerticalLayout();
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
