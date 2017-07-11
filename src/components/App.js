// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../actions";
import { getSelectedSource, getPaneCollapse } from "../selectors";
import type { SourceRecord } from "../reducers/sources";
import { isVisible } from "../utils/ui";

import { KeyShortcuts } from "devtools-modules";
const shortcuts = new KeyShortcuts({ window });
window.oncontextmenu = e => false;

const verticalLayoutBreakpoint = window.matchMedia("(min-width: 800px)");

import "./variables.css";
import "./App.css";
import "./shared/menu.css";
import "./shared/reps.css";

import _SplitBox from "devtools-splitter";
const SplitBox = createFactory(_SplitBox);

import _ProjectSearch from "./ProjectSearch";
const ProjectSearch = createFactory(_ProjectSearch);

import _PrimaryPanes from "./PrimaryPanes";
const PrimaryPanes = createFactory(_PrimaryPanes);

import _Editor from "./Editor";
const Editor = createFactory(_Editor);

import _SecondaryPanes from "./SecondaryPanes";
const SecondaryPanes = createFactory(_SecondaryPanes);

import _WelcomeBox from "./WelcomeBox";
const WelcomeBox = createFactory(_WelcomeBox);

import _EditorTabs from "./Editor/Tabs";
const EditorTabs = createFactory(_EditorTabs);

type Props = {
  selectSource: Function,
  selectedSource: SourceRecord,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean
};

class App extends Component {
  state: {
    horizontal: boolean,
    startPanelSize: number,
    endPanelSize: number
  };

  props: Props;
  onLayoutChange: Function;
  getChildContext: Function;
  renderEditorPane: Function;
  renderVerticalLayout: Function;

  constructor(props) {
    super(props);
    this.state = {
      horizontal: verticalLayoutBreakpoint.matches,
      startPanelSize: 0,
      endPanelSize: 0
    };

    this.getChildContext = this.getChildContext.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.renderEditorPane = this.renderEditorPane.bind(this);
    this.renderVerticalLayout = this.renderVerticalLayout.bind(this);
  }

  getChildContext() {
    return { shortcuts };
  }

  componentDidMount() {
    verticalLayoutBreakpoint.addListener(this.onLayoutChange);
  }

  componentWillUnmount() {
    verticalLayoutBreakpoint.removeListener(this.onLayoutChange);
  }

  onLayoutChange() {
    if (isVisible()) {
      this.setState({ horizontal: verticalLayoutBreakpoint.matches });
    }
  }

  renderEditorPane() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const { horizontal, endPanelSize, startPanelSize } = this.state;
    return dom.div(
      { className: "editor-pane" },
      dom.div(
        { className: "editor-container" },
        EditorTabs({
          startPanelCollapsed,
          endPanelCollapsed,
          horizontal,
          endPanelSize,
          startPanelSize
        }),
        Editor({ horizontal, startPanelSize, endPanelSize }),
        !this.props.selectedSource ? WelcomeBox({ horizontal }) : null,
        ProjectSearch()
      )
    );
  }

  renderHorizontalLayout() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
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
        onResizeEnd: size => this.setState({ startPanelSize: size }),
        startPanel: PrimaryPanes({ horizontal }),
        startPanelCollapsed,
        endPanel: SplitBox({
          style: { overflowX },
          initialSize: "300px",
          minSize: 10,
          maxSize: "80%",
          splitterSize: 1,
          onResizeEnd: size => this.setState({ endPanelSize: size }),
          endPanelControl: true,
          startPanel: this.renderEditorPane(),
          endPanel: SecondaryPanes({ horizontal }),
          endPanelCollapsed,
          vert: horizontal
        })
      })
    );
  }

  renderVerticalLayout() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
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
          startPanel: PrimaryPanes({ horizontal }),
          endPanel: this.renderEditorPane()
        }),
        endPanel: SecondaryPanes({ horizontal }),
        endPanelCollapsed
      })
    );
  }

  render() {
    return this.state.horizontal
      ? this.renderHorizontalLayout()
      : this.renderVerticalLayout();
  }
}

App.displayName = "App";

App.childContextTypes = { shortcuts: PropTypes.object };

export default connect(
  state => ({
    selectedSource: getSelectedSource(state),
    startPanelCollapsed: getPaneCollapse(state, "start"),
    endPanelCollapsed: getPaneCollapse(state, "end")
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
