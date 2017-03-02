// @flow
const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSources, getSelectedSource, getPaneCollapse } = require("../selectors");

const { KeyShortcuts } = require("devtools-sham-modules");
const shortcuts = new KeyShortcuts({ window });

const verticalLayoutBreakpoint = window.matchMedia("(min-width: 800px)");

require("./variables.css");
require("./App.css");
require("./shared/menu.css");
require("./shared/SplitBox.css");
require("./shared/reps.css");
let { SplitBox } = require("devtools-modules");
SplitBox = createFactory(SplitBox);

const SourceSearch = createFactory(require("./SourceSearch"));
const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const SecondaryPanes = createFactory(require("./SecondaryPanes"));
const WelcomeBox = createFactory(require("./WelcomeBox"));
const EditorTabs = createFactory(require("./Editor/Tabs"));

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectSource: PropTypes.func,
    selectedSource: PropTypes.object,
    startPanelCollapsed: PropTypes.bool,
    endPanelCollapsed: PropTypes.bool,
  },

  displayName: "App",

  getChildContext() {
    return { shortcuts };
  },

  componentDidMount() {
    verticalLayoutBreakpoint.addListener(this.onLayoutChange);
  },

  componentWillUnmount() {
    verticalLayoutBreakpoint.removeListener(this.onLayoutChange);
  },

  getInitialState() {
    return { horizontal: verticalLayoutBreakpoint.matches };
  },

  onLayoutChange() {
    this.setState({
      horizontal: verticalLayoutBreakpoint.matches
    });
  },

  renderEditorPane() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const { horizontal } = this.state;
    return dom.div(
      { className: "editor-pane" },
      dom.div(
        { className: "editor-container" },
        EditorTabs({
          startPanelCollapsed,
          endPanelCollapsed,
          horizontal
        }),
        Editor({ horizontal }),
        !this.props.selectedSource ? WelcomeBox({ horizontal }) : null,
        SourceSearch()
      )
    );
  },

  renderHorizontalLayout() {
    const { sources, startPanelCollapsed, endPanelCollapsed } = this.props;
    const { horizontal } = this.state;

    const overflowX = endPanelCollapsed ? "hidden" : "auto";

    return dom.div(
      { className: "debugger" },
      SplitBox({
        style: { width: "100vw" },
        initialSize: "250px",
        minSize: 10,
        maxSize: "50%",
        splitterSize: 1,
        startPanel: Sources({ sources, horizontal }),
        startPanelCollapsed,
        endPanel: SplitBox({
          style: { overflowX },
          initialSize: "300px",
          minSize: 10,
          maxSize: "80%",
          splitterSize: 1,
          endPanelControl: true,
          startPanel: this.renderEditorPane(),
          endPanel: SecondaryPanes({ horizontal }),
          endPanelCollapsed,
          vert: horizontal
        }),
      }));
  },

  renderVerticalLayout() {
    const { sources, startPanelCollapsed, endPanelCollapsed } = this.props;
    const { horizontal } = this.state;

    return dom.div(
      { className: "debugger" },
      SplitBox({
        style: { width: "100vw" },
        initialSize: "300px",
        minSize: 30,
        maxSize: "99%",
        splitterSize: 1,
        vert: horizontal,
        startPanel: SplitBox({
          style: { width: "100vw" },
          initialSize: "250px",
          minSize: 10,
          maxSize: "40%",
          splitterSize: 1,
          startPanelCollapsed,
          startPanel: Sources({ sources, horizontal }),
          endPanel: this.renderEditorPane(),
        }),
        endPanel: SecondaryPanes({ horizontal }),
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
    startPanelCollapsed: getPaneCollapse(state, "start"),
    endPanelCollapsed: getPaneCollapse(state, "end"),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
