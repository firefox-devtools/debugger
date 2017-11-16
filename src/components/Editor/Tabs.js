/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as I from "immutable";

import {
  getSelectedSource,
  getSourcesForTabs,
  getActiveSearch,
  getSearchTabs
} from "../../selectors";
import { isVisible } from "../../utils/ui";

import { getFilename, getFileURL, isPretty } from "../../utils/source";
import classnames from "classnames";
import actions from "../../actions";
import CloseButton from "../shared/Button/Close";
import { showMenu, buildMenu } from "devtools-contextmenu";
import { debounce } from "lodash";
import "./Tabs.css";

import PaneToggleButton from "../shared/Button/PaneToggle";
import Dropdown from "../shared/Dropdown";

import type { List } from "immutable";
import type { SourceRecord } from "../../reducers/sources";
import type { ActiveSearchType } from "../../reducers/ui";
type SourcesList = List<SourceRecord>;

/*
 * Finds the hidden tabs by comparing the tabs' top offset.
 * hidden tabs will have a great top offset.
 *
 * @param sourceTabs Immutable.list
 * @param sourceTabEls HTMLCollection
 *
 * @returns Immutable.list
 */
function getHiddenTabs(sourceTabs: SourcesList, sourceTabEls) {
  sourceTabEls = [].slice.call(sourceTabEls);
  function getTopOffset() {
    const topOffsets = sourceTabEls.map(t => t.getBoundingClientRect().top);
    return Math.min(...topOffsets);
  }

  function hasTopOffset(el) {
    // adding 10px helps account for cases where the tab might be offset by
    // styling such as selected tabs which don't have a border.
    const tabTopOffset = getTopOffset();
    return el.getBoundingClientRect().top > tabTopOffset + 10;
  }

  return sourceTabs.filter((tab, index) => {
    const element = sourceTabEls[index];
    return element && hasTopOffset(element);
  });
}

/**
 * Clipboard function taken from
 * https://dxr.mozilla.org/mozilla-central/source/devtools/shared/platform/content/clipboard.js
 */
function copyToTheClipboard(string) {
  const doCopy = function(e: any) {
    e.clipboardData.setData("text/plain", string);
    e.preventDefault();
  };

  document.addEventListener("copy", doCopy);
  document.execCommand("copy", false, null);
  document.removeEventListener("copy", doCopy);
}

type Props = {
  sourceTabs: SourcesList,
  searchTabs: List<ActiveSearchType>,
  selectedSource: SourceRecord,
  selectSource: (string, ?Object) => void,
  moveTab: (string, number) => void,
  closeTab: string => void,
  closeTabs: (List<string>) => void,
  setActiveSearch: (?ActiveSearchType) => void,
  closeActiveSearch: () => void,
  activeSearch: string,
  togglePrettyPrint: string => void,
  togglePaneCollapse: () => void,
  toggleActiveSearch: (?string) => void,
  showSource: string => void,
  horizontal: boolean,
  startPanelCollapsed: boolean,
  endPanelCollapsed: boolean,
  searchOn: boolean
};

type State = {
  dropdownShown: boolean,
  hiddenSourceTabs: SourcesList
};

class SourceTabs extends PureComponent<Props, State> {
  onTabContextMenu: Function;
  showContextMenu: Function;
  updateHiddenSourceTabs: Function;
  toggleSourcesDropdown: Function;
  renderDropdownSource: Function;
  renderTabs: Function;
  renderTab: Function;
  renderSourceTab: Function;
  renderSearchTab: Function;
  renderNewButton: Function;
  renderDropDown: Function;
  renderStartPanelToggleButton: Function;
  renderEndPanelToggleButton: Function;
  onResize: Function;

  constructor(props) {
    super(props);
    this.state = {
      dropdownShown: false,
      hiddenSourceTabs: I.List()
    };

    this.onTabContextMenu = this.onTabContextMenu.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.updateHiddenSourceTabs = this.updateHiddenSourceTabs.bind(this);
    this.toggleSourcesDropdown = this.toggleSourcesDropdown.bind(this);
    this.renderDropdownSource = this.renderDropdownSource.bind(this);
    this.renderTabs = this.renderTabs.bind(this);
    this.renderSourceTab = this.renderSourceTab.bind(this);
    this.renderSearchTab = this.renderSearchTab.bind(this);
    this.renderDropDown = this.renderDropdown.bind(this);
    this.renderStartPanelToggleButton = this.renderStartPanelToggleButton.bind(
      this
    );
    this.renderEndPanelToggleButton = this.renderEndPanelToggleButton.bind(
      this
    );

    this.onResize = debounce(() => {
      this.updateHiddenSourceTabs();
    });
  }

  componentDidUpdate(prevProps) {
    if (!(prevProps === this.props)) {
      this.updateHiddenSourceTabs();
    }
  }

  componentDidMount() {
    this.updateHiddenSourceTabs();
    window.addEventListener("resize", this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.onResize);
  }

  onTabContextMenu(event, tab: string) {
    event.preventDefault();
    this.showContextMenu(event, tab);
  }

  showContextMenu(e, tab) {
    const {
      closeTab,
      closeTabs,
      sourceTabs,
      showSource,
      togglePrettyPrint
    } = this.props;

    const closeTabLabel = L10N.getStr("sourceTabs.closeTab");
    const closeOtherTabsLabel = L10N.getStr("sourceTabs.closeOtherTabs");
    const closeTabsToEndLabel = L10N.getStr("sourceTabs.closeTabsToEnd");
    const closeAllTabsLabel = L10N.getStr("sourceTabs.closeAllTabs");
    const revealInTreeLabel = L10N.getStr("sourceTabs.revealInTree");
    const copyLinkLabel = L10N.getStr("copySourceUri2");
    const prettyPrintLabel = L10N.getStr("sourceTabs.prettyPrint");

    const closeTabKey = L10N.getStr("sourceTabs.closeTab.accesskey");
    const closeOtherTabsKey = L10N.getStr(
      "sourceTabs.closeOtherTabs.accesskey"
    );
    const closeTabsToEndKey = L10N.getStr(
      "sourceTabs.closeTabsToEnd.accesskey"
    );
    const closeAllTabsKey = L10N.getStr("sourceTabs.closeAllTabs.accesskey");
    const revealInTreeKey = L10N.getStr("sourceTabs.revealInTree.accesskey");
    const copyLinkKey = L10N.getStr("copySourceUri2.accesskey");
    const prettyPrintKey = L10N.getStr("sourceTabs.prettyPrint.accesskey");

    const tabs = sourceTabs.map(t => t.get("id"));
    const otherTabs = sourceTabs.filter(t => t.get("id") !== tab);
    const sourceTab = sourceTabs.find(t => t.get("id") == tab);
    const tabURLs = sourceTabs.map(thisTab => thisTab.get("url"));
    const otherTabURLs = otherTabs.map(thisTab => thisTab.get("url"));

    if (!sourceTab) {
      return;
    }

    const isPrettySource = isPretty(sourceTab.toJS());

    const closeTabMenuItem = {
      id: "node-menu-close-tab",
      label: closeTabLabel,
      accesskey: closeTabKey,
      disabled: false,
      click: () => closeTab(sourceTab.get("url"))
    };

    const closeOtherTabsMenuItem = {
      id: "node-menu-close-other-tabs",
      label: closeOtherTabsLabel,
      accesskey: closeOtherTabsKey,
      disabled: false,
      click: () => closeTabs(otherTabURLs)
    };

    const closeTabsToEndMenuItem = {
      id: "node-menu-close-tabs-to-end",
      label: closeTabsToEndLabel,
      accesskey: closeTabsToEndKey,
      disabled: false,
      click: () => {
        const tabIndex = tabs.findIndex(t => t == tab);
        closeTabs(tabURLs.filter((t, i) => i > tabIndex));
      }
    };

    const closeAllTabsMenuItem = {
      id: "node-menu-close-all-tabs",
      label: closeAllTabsLabel,
      accesskey: closeAllTabsKey,
      disabled: false,
      click: () => closeTabs(tabURLs)
    };

    const showSourceMenuItem = {
      id: "node-menu-show-source",
      label: revealInTreeLabel,
      accesskey: revealInTreeKey,
      disabled: false,
      click: () => showSource(tab)
    };

    const copySourceUri2 = {
      id: "node-menu-copy-source-url",
      label: copyLinkLabel,
      accesskey: copyLinkKey,
      disabled: false,
      click: () => copyToTheClipboard(sourceTab.get("url"))
    };

    const prettyPrint = {
      id: "node-menu-pretty-print",
      label: prettyPrintLabel,
      accesskey: prettyPrintKey,
      disabled: false,
      click: () => togglePrettyPrint(sourceTab.get("id"))
    };

    const items = [
      { item: closeTabMenuItem },
      { item: closeOtherTabsMenuItem, hidden: () => tabs.size === 1 },
      {
        item: closeTabsToEndMenuItem,
        hidden: () => tabs.some((t, i) => t === tab && tabs.size - 1 === i)
      },
      { item: closeAllTabsMenuItem },
      { item: { type: "separator" } },
      { item: copySourceUri2 }
    ];

    if (!isPrettySource) {
      items.push({ item: showSourceMenuItem });
      items.push({ item: prettyPrint });
    }

    showMenu(e, buildMenu(items));
  }

  /*
   * Updates the hiddenSourceTabs state, by
   * finding the source tabs which are wrapped and are not on the top row.
   */
  updateHiddenSourceTabs() {
    if (!this.refs.sourceTabs) {
      return;
    }
    const { selectedSource, sourceTabs, moveTab } = this.props;
    const sourceTabEls = this.refs.sourceTabs.children;
    const hiddenSourceTabs = getHiddenTabs(sourceTabs, sourceTabEls);

    if (isVisible() && hiddenSourceTabs.indexOf(selectedSource) !== -1) {
      return moveTab(selectedSource.get("url"), 0);
    }

    this.setState({ hiddenSourceTabs });
  }

  toggleSourcesDropdown(e) {
    this.setState({
      dropdownShown: !this.state.dropdownShown
    });
  }

  renderDropdownSource(source: SourceRecord) {
    const { selectSource } = this.props;
    const filename = getFilename(source.toJS());

    const onClick = () => selectSource(source.get("id"));
    return (
      <li key={source.get("id")} onClick={onClick}>
        {filename}
      </li>
    );
  }

  renderTabs() {
    const { sourceTabs } = this.props;
    if (!sourceTabs) {
      return;
    }

    return (
      <div className="source-tabs" ref="sourceTabs">
        {sourceTabs.map(this.renderSourceTab)}
      </div>
    );
  }

  isProjectSearchEnabled() {
    return this.props.activeSearch === "project";
  }

  isSourceSearchEnabled() {
    return this.props.activeSearch === "source";
  }

  renderSearchTab(source: ActiveSearchType) {
    const { closeTab, closeActiveSearch, setActiveSearch } = this.props;

    function tabName(tab) {
      return `${tab} search results`;
    }

    function onClickClose(ev) {
      ev.stopPropagation();
      closeActiveSearch();
      closeTab(source);
    }
    const className = classnames("source-tab", {
      active: this.isProjectSearchEnabled() || this.isSourceSearchEnabled(),
      pretty: false
    });

    return (
      <div
        className={className}
        key={source}
        onClick={() => setActiveSearch(source)}
        onContextMenu={e => this.onTabContextMenu(e, source)}
        title={tabName(source)}
      >
        <div className="filename">{tabName(source)}</div>
        <CloseButton
          handleClick={onClickClose}
          tooltip={L10N.getStr("sourceTabs.closeTabButtonTooltip")}
        />
      </div>
    );
  }

  renderSourceTab(source: SourceRecord) {
    const { selectedSource, selectSource, closeTab } = this.props;
    const filename = getFilename(source.toJS());
    const active =
      selectedSource &&
      source.get("id") == selectedSource.get("id") &&
      (!this.isProjectSearchEnabled() && !this.isSourceSearchEnabled());
    const isPrettyCode = isPretty(source.toJS());
    const sourceAnnotation = this.getSourceAnnotation(source);

    function onClickClose(ev) {
      ev.stopPropagation();
      closeTab(source.get("url"));
    }

    const className = classnames("source-tab", {
      active,
      pretty: isPrettyCode
    });

    return (
      <div
        className={className}
        key={source.get("id")}
        onClick={() => selectSource(source.get("id"))}
        onContextMenu={e => this.onTabContextMenu(e, source.get("id"))}
        title={getFileURL(source.toJS())}
      >
        {sourceAnnotation}
        <div className="filename">{filename}</div>
        <CloseButton
          handleClick={onClickClose}
          tooltip={L10N.getStr("sourceTabs.closeTabButtonTooltip")} //ey girl
        />
      </div>
    );
  }

  renderNewButton() {
    const newTabTooltip = L10N.getFormatStr(
      "sourceTabs.newTabButtonTooltip",
      formatKeyShortcut(L10N.getStr("sources.search.key2"))
    );

    const onButtonClick = () => {
      if (this.props.searchOn) {
        return this.props.closeActiveSearch();
      }
      this.props.setActiveSearch("source");
    };

    return (
      <div
        className="new-tab-btn"
        onClick={onButtonClick}
        title={newTabTooltip}
      >
        <Svg name="plus" />
      </div>
    );
  }

  renderDropdown() {
    const hiddenSourceTabs = this.state.hiddenSourceTabs;
    if (!hiddenSourceTabs || hiddenSourceTabs.size == 0) {
      return null;
    }

    const Panel = <ul>{hiddenSourceTabs.map(this.renderDropdownSource)}</ul>;

    return <Dropdown panel={Panel} />;
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
    if (!this.props.horizontal) {
      return;
    }

    return (
      <PaneToggleButton
        position="end"
        collapsed={!this.props.endPanelCollapsed}
        handleClick={this.props.togglePaneCollapse}
        horizontal={this.props.horizontal}
      />
    );
  }

  getSourceAnnotation(source) {
    const sourceObj = source.toJS();

    if (isPretty(sourceObj)) {
      return <img className="prettyPrint" />;
    }
    if (sourceObj.isBlackBoxed) {
      return <img className="blackBox" />;
    }
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
      searchTabs: getSearchTabs(state),
      sourceTabs: getSourcesForTabs(state),
      activeSearch: getActiveSearch(state),
      searchOn: getActiveSearch(state) === "source"
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceTabs);
