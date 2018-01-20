/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as I from "immutable";

import { getSelectedSource, getSourcesForTabs } from "../../selectors";
import { isVisible } from "../../utils/ui";

import { getHiddenTabs } from "../../utils/tabs";
import { getFilename, isPretty } from "../../utils/source";
import actions from "../../actions";

import { debounce } from "lodash";
import "./Tabs.css";

import Tab from "./Tab";
import PaneToggleButton from "../shared/Button/PaneToggle";
import Dropdown from "../shared/Dropdown";

import type { List } from "immutable";
import type { SourceRecord } from "../../reducers/sources";
import type { ActiveSearchType } from "../../reducers/ui";

type SourcesList = List<SourceRecord>;

type Props = {
  tabSources: SourcesList,
  selectedSource: SourceRecord,
  selectSource: Object => void,
  moveTab: (string, number) => void,
  closeTab: string => void,
  togglePaneCollapse: () => void,
  showSource: string => void,
  horizontal: boolean,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean
};

type State = {
  dropdownShown: boolean,
  hiddenTabs: SourcesList
};

class Tabs extends PureComponent<Props, State> {
  onTabContextMenu: Function;
  showContextMenu: Function;
  updateHiddenTabs: Function;
  toggleSourcesDropdown: Function;
  renderDropdownSource: Function;
  renderTabs: Function;
  renderDropDown: Function;
  renderStartPanelToggleButton: Function;
  renderEndPanelToggleButton: Function;
  onResize: Function;

  constructor(props) {
    super(props);
    this.state = {
      dropdownShown: false,
      hiddenTabs: I.List()
    };

    this.onResize = debounce(() => {
      this.updateHiddenTabs();
    });
  }

  componentDidUpdate(prevProps) {
    if (!(prevProps === this.props)) {
      this.updateHiddenTabs();
    }
  }

  componentDidMount() {
    this.updateHiddenTabs();
    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  /*
   * Updates the hiddenSourceTabs state, by
   * finding the source tabs which are wrapped and are not on the top row.
   */
  updateHiddenTabs() {
    if (!this.refs.sourceTabs) {
      return;
    }
    const { selectedSource, tabSources, moveTab } = this.props;
    const sourceTabEls = this.refs.sourceTabs.children;
    const hiddenTabs = getHiddenTabs(tabSources, sourceTabEls);

    if (isVisible() && hiddenTabs.indexOf(selectedSource) !== -1) {
      return moveTab(selectedSource.get("url"), 0);
    }

    this.setState({ hiddenTabs });
  }

  toggleSourcesDropdown(e) {
    this.setState({
      dropdownShown: !this.state.dropdownShown
    });
  }

  getIconClass(source: SourceRecord) {
    if (isPretty(source)) {
      return "prettyPrint";
    }
    if (source.get("isBlackBoxed")) {
      return "blackBox";
    }
    return "file";
  }

  renderDropdownSource = (source: SourceRecord) => {
    const { selectSource } = this.props;
    const filename = getFilename(source.toJS());

    const onClick = () => selectSource(source.get("id"));
    return (
      <li key={source.get("id")} onClick={onClick}>
        <img className={`dropdown-icon ${this.getIconClass(source)}`} />
        {filename}
      </li>
    );
  };

  renderTabs() {
    const { tabSources } = this.props;
    if (!tabSources) {
      return;
    }

    return (
      <div className="source-tabs" ref="sourceTabs">
        {tabSources.map((source, index) => <Tab key={index} source={source} />)}
      </div>
    );
  }

  renderDropdown() {
    const hiddenTabs = this.state.hiddenTabs;
    if (!hiddenTabs || hiddenTabs.size == 0) {
      return null;
    }

    const Panel = <ul>{hiddenTabs.map(this.renderDropdownSource)}</ul>;

    return <Dropdown panel={Panel} icon={"»"} />;
  }

  renderStartPanelToggleButton() {
    return (
      <PaneToggleButton
        position="start"
        collapsed={!this.props.startPanelCollapsed}
        handleClick={this.props.togglePaneCollapse}
      />
    );
  }

  renderEndPanelToggleButton() {
    const { horizontal, endPanelCollapsed, togglePaneCollapse } = this.props;
    if (!horizontal) {
      return;
    }

    return (
      <PaneToggleButton
        position="end"
        collapsed={!endPanelCollapsed}
        handleClick={togglePaneCollapse}
        horizontal={horizontal}
      />
    );
  }

  render() {
    return (
      <div className="source-header">
        {this.renderStartPanelToggleButton()}
        {this.renderTabs()}
        {this.renderDropdown()}
        {this.renderEndPanelToggleButton()}
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      selectedSource: getSelectedSource(state),
      tabSources: getSourcesForTabs(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Tabs);
