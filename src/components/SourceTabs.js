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
const classnames = require("classnames");
const actions = require("../actions");
const { isEnabled } = require("devtools-config");
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

const SourceTabs = React.createClass({
  propTypes: {
    sourceTabs: ImPropTypes.list,
    selectedSource: ImPropTypes.map,
    selectSource: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired,
    closeTabs: PropTypes.func.isRequired,
    toggleFileSearch: PropTypes.func.isRequired
  },

  displayName: "SourceTabs",

  getInitialState() {
    return {
      dropdownShown: false,
      hiddenSourceTabs: null
    };
  },

  componentDidUpdate() {
    this.updateHiddenSourceTabs(this.props.sourceTabs);
  },

  onTabContextMenu(event, tab) {
    event.preventDefault();
    this.showContextMenu(event, tab);
  },

  showContextMenu(e, tab) {
    const { closeTab, closeTabs, sourceTabs } = this.props;

    const closeTabLabel = L10N.getStr("sourceTabs.closeTab");
    const closeOtherTabsLabel = L10N.getStr("sourceTabs.closeOtherTabs");
    const closeTabsToRightLabel = L10N.getStr("sourceTabs.closeTabsToRight");
    const closeAllTabsLabel = L10N.getStr("sourceTabs.closeAllTabs");

    const tabs = sourceTabs.map(t => t.get("id"));

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
        tabs.reverse().every((t) => {
          if (t === tab) {
            return false;
          }
          closeTab(t);
          return true;
        });
      }
    };

    const closeAllTabsMenuItem = {
      id: "node-menu-close-all-tabs",
      label: closeAllTabsLabel,
      accesskey: "A",
      disabled: false,
      click: () => closeTabs(tabs)
    };

    showMenu(e, buildMenu([
      { item: closeTabMenuItem },
      { item: closeOtherTabsMenuItem, hidden: () => tabs.size === 1 },
      { item: closeTabsToRightMenuItem, hidden: () =>
         tabs.some((t, i) => t === tab && (tabs.size - 1) === i) },
      { item: closeAllTabsMenuItem }
    ]));
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

    if (!hiddenSourceTabs.equals(this.state.hiddenSourceTabs)) {
      this.setState({ hiddenSourceTabs });
    }
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
    if (!isEnabled("tabs")) {
      return dom.div({ className: "source-header" });
    }

    return dom.div({ className: "source-header" },
      this.renderTabs(),
      this.renderNewButton(),
      this.renderDropdown()
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
