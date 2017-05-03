// @flow

import { DOM as dom, PropTypes, PureComponent, createFactory } from "react";
import ImPropTypes from "react-immutable-proptypes";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  getSelectedSource,
  getSourcesForTabs,
  getProjectSearchState
} from "../../selectors";
import { getFilename, isPretty } from "../../utils/source";
import classnames from "classnames";
import actions from "../../actions";
import CloseButton from "../shared/Button/Close";
import Svg from "../shared/Svg";
import { showMenu, buildMenu } from "devtools-launchpad";
import debounce from "lodash/debounce";
import { formatKeyShortcut } from "../../utils/text";
import "./Tabs.css";

import _PaneToggleButton from "../shared/Button/PaneToggle";
const PaneToggleButton = createFactory(_PaneToggleButton);

import _Dropdown from "../shared/Dropdown";
const Dropdown = createFactory(_Dropdown);

/*
 * Finds the hidden tabs by comparing the tabs' top offset.
 * hidden tabs will have a great top offset.
 *
 * @param sourceTabs Immutable.list
 * @param sourceTabEls HTMLCollection
 *
 * @returns Immutable.list
 */
function getHiddenTabs(sourceTabs, sourceTabEls) {
  sourceTabEls = [].slice.call(sourceTabEls);
  function getTopOffset() {
    const topOffsets = sourceTabEls.map(t => t.getBoundingClientRect().top);
    return Math.min(...topOffsets);
  }

  const tabTopOffset = getTopOffset();
  return sourceTabs.filter((tab, index) => {
    // adding 10px helps account for cases where the tab might be offset by
    // styling such as selected tabs which don't have a border.
    return sourceTabEls[index].getBoundingClientRect().top > tabTopOffset + 10;
  });
}

/**
 * Clipboard function taken from
 * https://dxr.mozilla.org/mozilla-central/source/devtools/shared/platform/content/clipboard.js
 */
function copyToTheClipboard(string) {
  let doCopy = function(e: any) {
    e.clipboardData.setData("text/plain", string);
    e.preventDefault();
  };

  document.addEventListener("copy", doCopy);
  document.execCommand("copy", false, null);
  document.removeEventListener("copy", doCopy);
}

type State = {
  dropdownShown: boolean,
  hiddenSourceTabs: Array<Object> | null
};

class SourceTabs extends PureComponent {
  state: State;
  onTabContextMenu: Function;
  showContextMenu: Function;
  updateHiddenSourceTabs: Function;
  toggleSourcesDropdown: Function;
  renderDropdownSource: Function;
  renderTabs: Function;
  renderTab: Function;
  renderNewButton: Function;
  renderDropDown: Function;
  renderStartPanelToggleButton: Function;
  renderEndPanelToggleButton: Function;
  onResize: Function;

  constructor(props) {
    super(props);
    this.state = {
      dropdownShown: false,
      hiddenSourceTabs: null
    };

    this.onTabContextMenu = this.onTabContextMenu.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.updateHiddenSourceTabs = this.updateHiddenSourceTabs.bind(this);
    this.toggleSourcesDropdown = this.toggleSourcesDropdown.bind(this);
    this.renderDropdownSource = this.renderDropdownSource.bind(this);
    this.renderTabs = this.renderTabs.bind(this);
    this.renderTab = this.renderTab.bind(this);
    this.renderNewButton = this.renderNewButton.bind(this);
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

  onTabContextMenu(event, tab) {
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
    const copyLinkLabel = L10N.getStr("sourceTabs.copyLink");
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
    const copyLinkKey = L10N.getStr("sourceTabs.copyLink.accesskey");
    const prettyPrintKey = L10N.getStr("sourceTabs.prettyPrint.accesskey");

    const tabs = sourceTabs.map(t => t.get("id"));
    const otherTabs = sourceTabs.filter(t => t.get("id") !== tab);
    const sourceTab = sourceTabs.find(t => t.get("id") == tab);
    const tabURLs = sourceTabs.map(thisTab => thisTab.get("url"));
    const otherTabURLs = otherTabs.map(thisTab => thisTab.get("url"));
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

    const copySourceUrl = {
      id: "node-menu-close-tabs-to-right",
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
      { item: copySourceUrl }
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
    const { selectedSource, sourceTabs, selectSource } = this.props;
    const sourceTabEls = this.refs.sourceTabs.children;
    const hiddenSourceTabs = getHiddenTabs(sourceTabs, sourceTabEls);

    if (hiddenSourceTabs.indexOf(selectedSource) !== -1) {
      return selectSource(selectedSource.get("id"), { tabIndex: 0 });
    }

    this.setState({ hiddenSourceTabs });
  }

  toggleSourcesDropdown(e) {
    this.setState({
      dropdownShown: !this.state.dropdownShown
    });
  }

  renderDropdownSource(source) {
    const { selectSource } = this.props;
    const filename = getFilename(source.toJS());

    return dom.li(
      {
        key: source.get("id"),
        onClick: () => {
          // const tabIndex = getLastVisibleTabIndex(sourceTabs, sourceTabEls);
          const tabIndex = 0;
          selectSource(source.get("id"), { tabIndex });
        }
      },
      filename
    );
  }

  renderTabs() {
    const sourceTabs = this.props.sourceTabs;
    return dom.div(
      { className: "source-tabs", ref: "sourceTabs" },
      sourceTabs.map(this.renderTab)
    );
  }

  renderTab(source) {
    const { selectedSource, selectSource, closeTab } = this.props;
    const filename = getFilename(source.toJS());
    const active =
      selectedSource && source.get("id") == selectedSource.get("id");
    const isPrettyCode = isPretty(source.toJS());
    const sourceAnnotation = this.getSourceAnnotation(source);

    function onClickClose(ev) {
      ev.stopPropagation();
      closeTab(source.get("url"));
    }

    return dom.div(
      {
        className: classnames("source-tab", {
          active,
          pretty: isPrettyCode
        }),
        key: source.get("id"),
        onClick: () => selectSource(source.get("id")),
        onContextMenu: e => this.onTabContextMenu(e, source.get("id")),
        title: getFilename(source.toJS())
      },
      sourceAnnotation,
      dom.div({ className: "filename" }, filename),
      CloseButton({
        handleClick: onClickClose,
        tooltip: L10N.getStr("sourceTabs.closeTabButtonTooltip")
      })
    );
  }

  renderNewButton() {
    const newTabTooltip = L10N.getFormatStr(
      "sourceTabs.newTabButtonTooltip",
      formatKeyShortcut(`CmdOrCtrl+${L10N.getStr("sources.search.key")}`)
    );
    return dom.div(
      {
        className: "new-tab-btn",
        onClick: () => this.props.toggleProjectSearch(),
        title: newTabTooltip
      },
      Svg("plus")
    );
  }

  renderDropdown() {
    const hiddenSourceTabs = this.state.hiddenSourceTabs;
    if (!hiddenSourceTabs || hiddenSourceTabs.size == 0) {
      return dom.div({});
    }

    return Dropdown({
      panel: dom.ul({}, hiddenSourceTabs.map(this.renderDropdownSource))
    });
  }

  renderStartPanelToggleButton() {
    return PaneToggleButton({
      position: "start",
      collapsed: !this.props.startPanelCollapsed,
      handleClick: this.props.togglePaneCollapse
    });
  }

  renderEndPanelToggleButton() {
    if (!this.props.horizontal) {
      return;
    }

    return PaneToggleButton({
      position: "end",
      collapsed: !this.props.endPanelCollapsed,
      handleClick: this.props.togglePaneCollapse,
      horizontal: this.props.horizontal
    });
  }

  getSourceAnnotation(source) {
    let sourceObj = source.toJS();

    if (isPretty(sourceObj)) {
      return Svg("prettyPrint");
    }
    if (sourceObj.isBlackBoxed) {
      return Svg("blackBox");
    }
  }

  render() {
    return dom.div(
      { className: "source-header" },
      this.renderStartPanelToggleButton(),
      this.renderTabs(),
      this.renderNewButton(),
      this.renderDropdown(),
      this.renderEndPanelToggleButton()
    );
  }
}

SourceTabs.propTypes = {
  sourceTabs: ImPropTypes.list.isRequired,
  selectedSource: ImPropTypes.map,
  selectSource: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  closeTabs: PropTypes.func.isRequired,
  toggleProjectSearch: PropTypes.func.isRequired,
  togglePrettyPrint: PropTypes.func.isRequired,
  togglePaneCollapse: PropTypes.func.isRequired,
  showSource: PropTypes.func.isRequired,
  horizontal: PropTypes.bool.isRequired,
  startPanelCollapsed: PropTypes.bool.isRequired,
  endPanelCollapsed: PropTypes.bool.isRequired
};

SourceTabs.displayName = "SourceTabs";

module.exports = connect(
  state => {
    return {
      selectedSource: getSelectedSource(state),
      sourceTabs: getSourcesForTabs(state),
      searchOn: getProjectSearchState(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceTabs);
