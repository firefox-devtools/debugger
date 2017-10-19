// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { features } from "../utils/prefs";
import actions from "../actions";
import { ShortcutsModal } from "./ShortcutsModal";

import {
  getSelectedSource,
  getPaneCollapse,
  getActiveSearch,
  getOrientation
} from "../selectors";

import type { SourceRecord, OrientationType } from "../reducers/types";
import { isVisible } from "../utils/ui";

import { KeyShortcuts } from "devtools-modules";
const shortcuts = new KeyShortcuts({ window });

import { Services } from "devtools-modules";
const { appinfo } = Services;

const isMacOS = appinfo.OS === "Darwin";

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

import GotoLineModal from "./GotoLineModal";

type Props = {
  selectSource: Function,
  selectedSource: SourceRecord,
  orientation: OrientationType,
  startPanelCollapsed: boolean,
  closeActiveSearch: () => void,
  endPanelCollapsed: boolean,
  activeSearch: string,
  setActiveSearch: string => void,
  setOrientation: OrientationType => void
};

type State = {
  shortcutsModalEnabled: boolean,
  startPanelSize: number,
  endPanelSize: number
};

class App extends Component<Props, State> {
  onLayoutChange: Function;
  getChildContext: Function;
  renderEditorPane: Function;
  renderVerticalLayout: Function;
  toggleSymbolModal: Function;
  toggleGoToLineModal: Function;
  onEscape: Function;
  onCommandSlash: Function;

  constructor(props) {
    super(props);
    this.state = {
      shortcutsModalEnabled: false,
      startPanelSize: 0,
      endPanelSize: 0
    };

    this.getChildContext = this.getChildContext.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.toggleSymbolModal = this.toggleSymbolModal.bind(this);
    this.toggleGoToLineModal = this.toggleGoToLineModal.bind(this);
    this.renderEditorPane = this.renderEditorPane.bind(this);
    this.renderVerticalLayout = this.renderVerticalLayout.bind(this);
    this.onEscape = this.onEscape.bind(this);
    this.onCommandSlash = this.onCommandSlash.bind(this);
  }

  getChildContext() {
    return { shortcuts };
  }

  componentDidMount() {
    verticalLayoutBreakpoint.addListener(this.onLayoutChange);

    shortcuts.on(
      L10N.getStr("symbolSearch.search.key2"),
      this.toggleSymbolModal
    );

    shortcuts.on(L10N.getStr("gotoLineModal.key"), this.toggleGoToLineModal);

    shortcuts.on("Escape", this.onEscape);
    shortcuts.on("Cmd+/", this.onCommandSlash);
  }

  componentWillUnmount() {
    verticalLayoutBreakpoint.removeListener(this.onLayoutChange);
    shortcuts.off(
      L10N.getStr("symbolSearch.search.key2"),
      this.toggleSymbolModal
    );

    shortcuts.off(L10N.getStr("gotoLineModal.key"), this.toggleGoToLineModal);

    shortcuts.off("Escape", this.onEscape);
  }

  onEscape(_, e) {
    const { activeSearch, closeActiveSearch } = this.props;

    if (activeSearch) {
      e.preventDefault();
      closeActiveSearch();
    }
  }

  onCommandSlash() {
    this.toggleShortcutsModal();
  }

  isHorizontal() {
    return this.props.orientation === "horizontal";
  }

  toggleSymbolModal(_, e: SyntheticEvent) {
    const {
      selectedSource,
      activeSearch,
      closeActiveSearch,
      setActiveSearch
    } = this.props;

    e.preventDefault();
    e.stopPropagation();

    if (!selectedSource) {
      return;
    }

    if (activeSearch == "symbol") {
      return closeActiveSearch();
    }

    setActiveSearch("symbol");
  }

  toggleGoToLineModal(_, e: SyntheticEvent) {
    const {
      selectedSource,
      activeSearch,
      closeActiveSearch,
      setActiveSearch
    } = this.props;

    e.preventDefault();
    e.stopPropagation();

    if (!selectedSource) {
      return;
    }

    if (activeSearch == "line") {
      return closeActiveSearch();
    }

    setActiveSearch("line");
  }

  onLayoutChange() {
    if (isVisible()) {
      this.props.setOrientation(
        verticalLayoutBreakpoint.matches ? "horizontal" : "vertical"
      );
    }
  }

  renderEditorPane() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const { endPanelSize, startPanelSize } = this.state;
    const horizontal = this.isHorizontal();

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
          {!this.props.selectedSource ? (
            <WelcomeBox horizontal={horizontal} />
          ) : null}
          <ProjectSearch />
        </div>
      </div>
    );
  }

  toggleShortcutsModal() {
    this.setState({
      shortcutsModalEnabled: !this.state.shortcutsModalEnabled
    });
  }

  renderHorizontalLayout() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const horizontal = this.isHorizontal();

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
            endPanel={
              <SecondaryPanes
                horizontal={horizontal}
                toggleShortcutsModal={() => this.toggleShortcutsModal()}
              />
            }
            endPanelCollapsed={endPanelCollapsed}
            vert={horizontal}
          />
        }
      />
    );
  }

  renderVerticalLayout() {
    const { startPanelCollapsed, endPanelCollapsed } = this.props;
    const horizontal = this.isHorizontal();

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
        endPanel={
          <SecondaryPanes
            horizontal={horizontal}
            toggleShortcutsModal={() => this.toggleShortcutsModal()}
          />
        }
        endPanelCollapsed={endPanelCollapsed}
      />
    );
  }

  renderSymbolModal() {
    const { selectSource, selectedSource, activeSearch } = this.props;

    if (activeSearch !== "symbol") {
      return;
    }

    return (
      <SymbolModal
        selectSource={selectSource}
        selectedSource={selectedSource}
      />
    );
  }

  renderGotoLineModal() {
    const { selectSource, selectedSource, activeSearch } = this.props;

    if (activeSearch !== "line") {
      return;
    }

    return (
      <GotoLineModal
        selectSource={selectSource}
        selectedSource={selectedSource}
      />
    );
  }

  renderShortcutsModal() {
    const additionalClass = isMacOS ? "mac" : "";

    if (!features.shortcuts) {
      return;
    }

    return (
      <ShortcutsModal
        additionalClass={additionalClass}
        enabled={this.state.shortcutsModalEnabled}
        handleClose={() => this.toggleShortcutsModal()}
      />
    );
  }

  render() {
    return (
      <div className="debugger">
        {this.isHorizontal()
          ? this.renderHorizontalLayout()
          : this.renderVerticalLayout()}
        {this.renderSymbolModal()}
        {this.renderGotoLineModal()}
        {this.renderShortcutsModal()}
      </div>
    );
  }
}

App.childContextTypes = { shortcuts: PropTypes.object };

function mapStateToProps(state) {
  return {
    selectedSource: getSelectedSource(state),
    startPanelCollapsed: getPaneCollapse(state, "start"),
    endPanelCollapsed: getPaneCollapse(state, "end"),
    activeSearch: getActiveSearch(state),
    orientation: getOrientation(state)
  };
}

export default connect(mapStateToProps, dispatch =>
  bindActionCreators(actions, dispatch)
)(App);
