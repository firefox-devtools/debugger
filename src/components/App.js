/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
  getQuickOpenEnabled,
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

import QuickOpenModal from "./QuickOpenModal";

type Props = {
  selectedSource: SourceRecord,
  orientation: OrientationType,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean,
  activeSearch: string,
  quickOpenEnabled: boolean,
  setActiveSearch: string => void,
  closeActiveSearch: () => void,
  openQuickOpen: (query?: string) => void,
  closeQuickOpen: () => void,
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
  toggleQuickOpenModal: Function;
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
    this.toggleQuickOpenModal = this.toggleQuickOpenModal.bind(this);
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

    shortcuts.on(L10N.getStr("symbolSearch.search.key2"), (_, e) =>
      this.toggleQuickOpenModal(_, e, "@")
    );

    const searchKeys = [
      L10N.getStr("sources.search.key2"),
      L10N.getStr("sources.search.alt.key")
    ];
    searchKeys.forEach(key => shortcuts.on(key, this.toggleQuickOpenModal));

    shortcuts.on(L10N.getStr("gotoLineModal.key"), (_, e) =>
      this.toggleQuickOpenModal(_, e, ":")
    );

    shortcuts.on("Escape", this.onEscape);
    shortcuts.on("Cmd+/", this.onCommandSlash);
  }

  componentWillUnmount() {
    verticalLayoutBreakpoint.removeListener(this.onLayoutChange);
    shortcuts.off(
      L10N.getStr("symbolSearch.search.key2"),
      this.toggleQuickOpenModal
    );

    const searchKeys = [
      L10N.getStr("sources.search.key2"),
      L10N.getStr("sources.search.alt.key")
    ];
    searchKeys.forEach(key => shortcuts.off(key, this.toggleQuickOpenModal));

    shortcuts.off(L10N.getStr("gotoLineModal.key"), this.toggleQuickOpenModal);

    shortcuts.off("Escape", this.onEscape);
  }

  onEscape(_, e) {
    const {
      activeSearch,
      quickOpenEnabled,
      closeActiveSearch,
      closeQuickOpen
    } = this.props;

    if (activeSearch) {
      e.preventDefault();
      closeActiveSearch();
    }

    if (quickOpenEnabled === true) {
      closeQuickOpen();
    }
  }

  onCommandSlash() {
    this.toggleShortcutsModal();
  }

  isHorizontal() {
    return this.props.orientation === "horizontal";
  }

  toggleQuickOpenModal(_, e: SyntheticEvent<HTMLElement>, query?: string) {
    const { quickOpenEnabled, openQuickOpen, closeQuickOpen } = this.props;

    e.preventDefault();
    e.stopPropagation();

    if (quickOpenEnabled === true) {
      closeQuickOpen();
      return;
    }

    if (query != null) {
      openQuickOpen(query);
      return;
    }
    openQuickOpen();
    return;
  }

  onLayoutChange() {
    const orientation = verticalLayoutBreakpoint.matches
      ? "horizontal"
      : "vertical";
    if (isVisible()) {
      this.props.setOrientation(orientation);
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
    const { quickOpenEnabled } = this.props;
    return (
      <div className="debugger">
        {this.isHorizontal()
          ? this.renderHorizontalLayout()
          : this.renderVerticalLayout()}
        {quickOpenEnabled === true && <QuickOpenModal />}
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
    quickOpenEnabled: getQuickOpenEnabled(state),
    orientation: getOrientation(state)
  };
}

export default connect(mapStateToProps, dispatch =>
  bindActionCreators(actions, dispatch)
)(App);
