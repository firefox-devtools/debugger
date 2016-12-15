const React = require("react");
const { DOM: dom, PropTypes } = React;
const ImPropTypes = require("react-immutable-proptypes");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const {
  getSelectedSource,
  getSourceTabs,
  getFileSearchState
} = require("../selectors");
const { getFilename } = require("../utils/source");
const { isEnabled } = require("devtools-config");
const classnames = require("classnames");
const actions = require("../actions");
const CloseButton = require("./CloseButton");
const Svg = require("./utils/Svg");
const Dropdown = React.createFactory(require("./Dropdown"));
const { showMenu, buildMenu } = require("../utils/menu");

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
    togglePane: PropTypes.func.isRequired,
    showSource: PropTypes.func.isRequired,
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
      this.updateHiddenSourceTabs(this.props.sourceTabs);
    }
  },

  onTabContextMenu(event, tab) {
    event.preventDefault();
    this.showContextMenu(event, tab);
  },

  showContextMenu(e, tab) {
    const { closeTab, closeTabs, sourceTabs, showSource } = this.props;

    const closeTabLabel = L10N.getStr("sourceTabs.closeTab");
    const closeOtherTabsLabel = L10N.getStr("sourceTabs.closeOtherTabs");
    const closeTabsToRightLabel = L10N.getStr("sourceTabs.closeTabsToRight");
    const closeAllTabsLabel = L10N.getStr("sourceTabs.closeAllTabs");

    const tabs = sourceTabs.map(t => t.get("id"));
    const sourceTab = sourceTabs.find(t => t.get("id") == tab);

    const closeTabMenuItem = {
      id: "node-menu-close-tab",
      label: closeTabLabel,
      accesskey: "C",
      disabled: false,
      click: () => closeTab(tab)
    };

    const closeOtherTabsMenuItem = {
      id: "node-menu-close-other-tabs",
      label: closeOtherTabsLabel,
      accesskey: "O",
      disabled: false,
      click: () => closeTabs(tabs.filter(t => t !== tab))
    };

    const closeTabsToRightMenuItem = {
      id: "node-menu-close-tabs-to-right",
      label: closeTabsToRightLabel,
      accesskey: "R",
      disabled: false,
      click: () => {
        const tabIndex = tabs.findIndex(t => t == tab);
        closeTabs(tabs.filter((t, i) => i > tabIndex));
      }
    };

    const closeAllTabsMenuItem = {
      id: "node-menu-close-all-tabs",
      label: closeAllTabsLabel,
      accesskey: "A",
      disabled: false,
      click: () => closeTabs(tabs)
    };

    const showSourceMenuItem = {
      id: "node-menu-show-source",
      label: "show source",
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

    const items = [
      { item: closeTabMenuItem },
      { item: closeOtherTabsMenuItem, hidden: () => tabs.size === 1 },
      { item: closeTabsToRightMenuItem, hidden: () =>
         tabs.some((t, i) => t === tab && (tabs.size - 1) === i) },
      { item: closeAllTabsMenuItem },
    ];

    if (isEnabled("copySource")) {
      items.push({ item: { type: "separator" }});
      items.push({ item: copySourceUrl });
    }

    if (isEnabled("showSource")) {
      items.push({ item: showSourceMenuItem });
    }

    showMenu(e, buildMenu(items));
  },

  /*
   * Updates the hiddenSourceTabs state, by
   * finding the source tabs who have wrapped and are not on the top row.
   */
  updateHiddenSourceTabs(sourceTabs) {
    if (!this.refs.sourceTabs) {
      return;
    }

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

    function onClickClose(ev) {
      ev.stopPropagation();
      closeTab(source.get("id"));
    }

    return dom.div(
      {
        className: classnames("source-tab", { active }),
        key: source.get("id"),
        onClick: () => selectSource(source.get("id")),
        onContextMenu: (e) => this.onTabContextMenu(e, source.get("id")),
        title: source.get("url")
      },
      dom.div({ className: "filename" }, filename),
      CloseButton({ handleClick: onClickClose }));
  },

  renderNewButton() {
    return dom.div({
      className: "new-tab-btn",
      onClick: () => this.props.toggleFileSearch(true)
    }, Svg("plus"));
  },

  renderToggleButton(position, collapsed) {
    return dom.div({
      className: classnames(`toggle-button-${position}`, { collapsed }),
      onClick: () => this.props.togglePane(position),
    }, Svg("togglePanes"));
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

  render() {
    return dom.div({ className: "source-header" },
      this.renderToggleButton("start", !this.props.startPanelCollapsed),
      this.renderTabs(),
      this.renderNewButton(),
      this.renderDropdown(),
      this.renderToggleButton("end", !this.props.endPanelCollapsed)
    );
  }
});

module.exports = connect(
  state => ({
    selectedSource: getSelectedSource(state),
    sourceTabs: getSourceTabs(state),
    searchOn: getFileSearchState(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SourceTabs);
