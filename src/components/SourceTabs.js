const React = require("react");
const { DOM: dom, PropTypes } = React;
const ImPropTypes = require("react-immutable-proptypes");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const {
  getSelectedSource, getSourceTabs,
  getFileSearchState, getSourceByURL
} = require("../selectors");
const { getFilename, isPretty } = require("../utils/source");
const classnames = require("classnames");
const actions = require("../actions");
const CloseButton = require("./shared/Button/Close");
const PaneToggleButton = React.createFactory(require("./shared/Button/PaneToggle"));
const Svg = require("./shared/Svg");
const Dropdown = React.createFactory(require("./Dropdown"));
const { showMenu, buildMenu } = require("../utils/menu");
const { debounce } = require("lodash");
const { formatKeyShortcut } = require("../utils/text");
require("./SourceTabs.css");
require("./Dropdown.css");

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
    return sourceTabEls[index].getBoundingClientRect().top > tabTopOffset;
  });
}

/**
 * Clipboard function taken from
 * https://dxr.mozilla.org/mozilla-central/source/devtools/shared/platform/content/clipboard.js
 */
function copyToTheClipboard(string) {
  let doCopy = function(e) {
    e.clipboardData.setData("text/plain", string);
    e.preventDefault();
  };

  document.addEventListener("copy", doCopy);
  document.execCommand("copy", false, null);
  document.removeEventListener("copy", doCopy);
}

const SourceTabs = React.createClass({
  propTypes: {
    sourceTabs: ImPropTypes.list,
    selectedSource: ImPropTypes.map,
    selectSource: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    closeTabs: PropTypes.func.isRequired,
    toggleFileSearch: PropTypes.func.isRequired,
    togglePrettyPrint: PropTypes.func.isRequired,
    togglePaneCollapse: PropTypes.func.isRequired,
    showSource: PropTypes.func.isRequired,
    horizontal: PropTypes.bool.isRequired,
    startPanelCollapsed: PropTypes.bool.isRequired,
    endPanelCollapsed: PropTypes.bool.isRequired,
  },

  displayName: "SourceTabs",

  getInitialState() {
    return {
      dropdownShown: false,
      hiddenSourceTabs: null
    };
  },

  componentDidUpdate(prevProps) {
    if (!(prevProps === this.props)) {
      this.updateHiddenSourceTabs();
    }
  },

  componentDidMount() {
    this.updateHiddenSourceTabs();
    window.addEventListener("resize", this.onResize, false);
  },

  componentDidDismount() {
    window.removeEventListener("resize", this.onResize);
  },

  onTabContextMenu(event, tab) {
    event.preventDefault();
    this.showContextMenu(event, tab);
  },

  showContextMenu(e, tab) {
    const {
      closeTab,
      closeTabs,
      sourceTabs,
      showSource,
      togglePrettyPrint } = this.props;

    const closeTabLabel = L10N.getStr("sourceTabs.closeTab");
    const closeOtherTabsLabel = L10N.getStr("sourceTabs.closeOtherTabs");
    const closeTabsToRightLabel = L10N.getStr("sourceTabs.closeTabsToRight");
    const closeAllTabsLabel = L10N.getStr("sourceTabs.closeAllTabs");

    const tabs = sourceTabs.map(t => t.get("id"));
    const otherTabs = sourceTabs.filter(t => t.get("id") !== tab);
    const sourceTab = sourceTabs.find(t => t.get("id") == tab);
    const tabURLs = sourceTabs.map(thisTab => thisTab.get("url"));
    const otherTabURLs = otherTabs.map(thisTab => thisTab.get("url"));
    const isPrettySource = isPretty({ url: sourceTab.get("url") });

    const closeTabMenuItem = {
      id: "node-menu-close-tab",
      label: closeTabLabel,
      accesskey: "C",
      disabled: false,
      click: () => closeTab(sourceTab.get("url"))
    };

    const closeOtherTabsMenuItem = {
      id: "node-menu-close-other-tabs",
      label: closeOtherTabsLabel,
      accesskey: "O",
      disabled: false,
      click: () => closeTabs(otherTabURLs)
    };

    const closeTabsToRightMenuItem = {
      id: "node-menu-close-tabs-to-right",
      label: closeTabsToRightLabel,
      accesskey: "R",
      disabled: false,
      click: () => {
        const tabIndex = tabs.findIndex(t => t == tab);
        closeTabs(tabURLs.filter((t, i) => i > tabIndex));
      }
    };

    const closeAllTabsMenuItem = {
      id: "node-menu-close-all-tabs",
      label: closeAllTabsLabel,
      accesskey: "A",
      disabled: false,
      click: () => closeTabs(tabURLs)
    };

    const showSourceMenuItem = {
      id: "node-menu-show-source",
      label: "Reveal in Tree",
      accesskey: "s",
      disabled: false,
      click: () => showSource(tab)
    };

    const copySourceUrl = {
      id: "node-menu-close-tabs-to-right",
      label: "Copy Link Address",
      accesskey: "X",
      disabled: false,
      click: () => copyToTheClipboard(sourceTab.get("url"))
    };

    const prettyPrint = {
      id: "node-menu-pretty-print",
      label: "Pretty Print Source",
      accesskey: "Z",
      disabled: false,
      click: () => togglePrettyPrint(sourceTab.get("id"))
    };

    const items = [
      { item: closeTabMenuItem },
      { item: closeOtherTabsMenuItem, hidden: () => tabs.size === 1 },
      { item: closeTabsToRightMenuItem, hidden: () =>
         tabs.some((t, i) => t === tab && (tabs.size - 1) === i) },
      { item: closeAllTabsMenuItem },
      { item: { type: "separator" }},
      { item: copySourceUrl },
      { item: showSourceMenuItem }
    ];

    if (!isPrettySource) {
      items.push({ item: prettyPrint });
    }

    showMenu(e, buildMenu(items));
  },

  onResize: debounce(function() {
    this.updateHiddenSourceTabs();
  }),

  /*
   * Updates the hiddenSourceTabs state, by
   * finding the source tabs who have wrapped and are not on the top row.
   */
  updateHiddenSourceTabs() {
    if (!this.refs.sourceTabs) {
      return;
    }

    const sourceTabs = this.props.sourceTabs;
    const sourceTabEls = this.refs.sourceTabs.children;
    const hiddenSourceTabs = getHiddenTabs(sourceTabs, sourceTabEls);

    this.setState({ hiddenSourceTabs });
  },

  toggleSourcesDropdown(e) {
    this.setState({
      dropdownShown: !this.state.dropdownShown,
    });
  },

  renderDropdownSource(source) {
    const { selectSource } = this.props;
    const filename = getFilename(source.toJS());

    return dom.li({
      key: source.get("id"),
      onClick: () => {
        // const tabIndex = getLastVisibleTabIndex(sourceTabs, sourceTabEls);
        const tabIndex = 0;
        selectSource(source.get("id"), { tabIndex });
      }
    }, filename);
  },

  renderTabs() {
    const sourceTabs = this.props.sourceTabs;
    return dom.div(
      { className: "source-tabs", ref: "sourceTabs" },
      sourceTabs.map(this.renderTab)
    );
  },

  renderTab(source) {
    const { selectedSource, selectSource, closeTab } = this.props;
    const filename = getFilename(source.toJS());
    const active = source.get("id") == selectedSource.get("id");
    const isPrettyCode = isPretty({ url: source.get("url") });

    function onClickClose(ev) {
      ev.stopPropagation();
      closeTab(source.get("url"));
    }

    return dom.div(
      {
        className: classnames("source-tab", {
          active,
          pretty: isPretty({ url: source.get("url") })
        }),
        key: source.get("id"),
        onClick: () => selectSource(source.get("id")),
        onContextMenu: (e) => this.onTabContextMenu(e, source.get("id")),
        title: getFilename(source.toJS())
      },
      isPrettyCode ? Svg("prettyPrint") : null,
      dom.div({ className: "filename" }, filename),
      CloseButton({
        handleClick: onClickClose,
        tooltip: L10N.getStr("sourceTabs.closeTabButtonTooltip")
      }));
  },

  renderNewButton() {
    const newTabTooltip = L10N.getFormatStr("sourceTabs.newTabButtonTooltip",
      formatKeyShortcut(`CmdOrCtrl+${L10N.getStr("sources.search.key")}`));
    return dom.div({
      className: "new-tab-btn",
      onClick: () => this.props.toggleFileSearch(true),
      title: newTabTooltip
    }, Svg("plus"));
  },

  renderDropdown() {
    const hiddenSourceTabs = this.state.hiddenSourceTabs;
    if (!hiddenSourceTabs || hiddenSourceTabs.size == 0) {
      return dom.div({});
    }

    return Dropdown({
      panel: dom.ul(
        {},
        this.state.hiddenSourceTabs.map(this.renderDropdownSource)
      )
    });
  },

  renderStartPanelToggleButton() {
    return PaneToggleButton({
      position: "start",
      collapsed: !this.props.startPanelCollapsed,
      handleClick: this.props.togglePaneCollapse
    });
  },

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
  },

  render() {
    return dom.div({ className: "source-header" },
      this.renderStartPanelToggleButton(),
      this.renderTabs(),
      this.renderNewButton(),
      this.renderDropdown(),
      this.renderEndPanelToggleButton()
    );
  }
});

function getTabs(state) {
  return getSourceTabs(state)
    .map(url => getSourceByURL(state, url));
}

module.exports = connect(
  state => {
    return {
      selectedSource: getSelectedSource(state),
      sourceTabs: getTabs(state),
      searchOn: getFileSearchState(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(SourceTabs);
