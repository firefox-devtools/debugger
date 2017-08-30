// @flow

import React, { PropTypes, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../actions";
import { getSelectedSource, getPaneCollapse } from "../selectors";
import type { SourceRecord } from "../reducers/sources";
import { isVisible } from "../utils/ui";

import { KeyShortcuts } from "devtools-modules";
const shortcuts = new KeyShortcuts({ window });

const verticalLayoutBreakpoint = window.matchMedia("(min-width: 800px)");

import "./variables.css";
import "./App.css";
import "./shared/menu.css";
import "./shared/reps.css";

import SplitBox from "devtools-splitter";

import ProjectSearch from "./ProjectSearch";

import PrimaryPanes from "./PrimaryPanes";

import Editor from "./Editor";

import SecondaryPanes from "./SecondaryPanes";

import WelcomeBox from "./WelcomeBox";

import EditorTabs from "./Editor/Tabs";

import SymbolModal from "./SymbolModal";

type Props = {
  selectSource: Function,
  selectedSource: SourceRecord,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean
};

type State = {
  horizontal: boolean,
  startPanelSize: number,
  endPanelSize: number
};

class App extends Component<> {
  static defaultProps: Props;
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

    return (
      <div className="editor-pane">
        <div className="editor-container">
          <EditorTabs
            startPanelCollapsed={startPanelCollapsed}
            endPanelCollapsed={endPanelCollapsed}
            horizontal={horizontal}
            startPanelSize={startPanelSize}
            endPanelSize={endPanelSize}
          />
          <Editor
            horizontal={horizontal}
            startPanelSize={startPanelSize}
            endPanelSize={endPanelSize}
          />
          {!this.props.selectedSource
            ? <WelcomeBox horizontal={horizontal} />
            : null}
          <ProjectSearch />
        </div>
      </div>
    );
  }

  renderHorizontalLayout() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const { horizontal } = this.state;

    const overflowX = endPanelCollapsed ? "hidden" : "auto";

    return (
      <SplitBox
        style={{ width: "100vw" }}
        initialSize="250px"
        minSize={10}
        maxSize="50%"
        splitterSize={1}
        onResizeEnd={size => this.setState({ startPanelSize: size })}
        startPanel={<PrimaryPanes horizontal={horizontal} />}
        startPanelCollapsed={startPanelCollapsed}
        endPanel={
          <SplitBox
            style={{ overflowX }}
            initialSize="300px"
            minSize={10}
            maxSize="80%"
            splitterSize={1}
            onResizeEnd={size => this.setState({ endPanelSize: size })}
            endPanelControl={true}
            startPanel={this.renderEditorPane()}
            endPanel={<SecondaryPanes horizontal={horizontal} />}
            endPanelCollapsed={endPanelCollapsed}
            vert={horizontal}
          />
        }
      />
    );
  }

  renderVerticalLayout() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const { horizontal } = this.state;

    return (
      <SplitBox
        style={{ width: "100vw" }}
        initialSize="300px"
        minSize={30}
        maxSize="99%"
        splitterSize={1}
        vert={horizontal}
        startPanel={
          <SplitBox
            style={{ width: "100vw" }}
            initialSize="250px"
            minSize={10}
            maxSize="40%"
            splitterSize={1}
            startPanelCollapsed={startPanelCollapsed}
            startPanel={<PrimaryPanes horizontal={horizontal} />}
            endPanel={this.renderEditorPane()}
          />
        }
        endPanel={<SecondaryPanes horizontal={horizontal} />}
        endPanelCollapsed={endPanelCollapsed}
      />
    );
  }

  render() {
    const { selectSource, selectedSource } = this.props;

    return (
      <div className="debugger">
        {this.state.horizontal
          ? this.renderHorizontalLayout()
          : this.renderVerticalLayout()}
        <SymbolModal
          selectSource={selectSource}
          selectedSource={selectedSource}
        />
      </div>
    );
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
