const React = require("react");
const { DOM: dom, PropTypes } = React;
const ImPropTypes = require("react-immutable-proptypes");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const Svg = require("./utils/Svg");
const { getSelectedSource, getSourceTabs } = require("../selectors");
const { endTruncateStr } = require("../utils/utils");
const classnames = require("classnames");
const actions = require("../actions");
const { isEnabled } = require("../feature");

require("./SourceTabs.css");
require("./Dropdown.css");

/**
 * TODO: this is a placeholder function
 */
function getFilename(url) {
  if (!url) {
    return "";
  }

  let name = url;
  const m = url.toString().match(/.*\/(.+?\..*$)/);
  if (m && m.length > 1) {
    name = m[1];
  }

  return endTruncateStr(name, 50);
}

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

/*
 * Get the last visible tab index so that we can replace the last
 * tab with the newly selected source.
 */
function getLastVisibleTabIndex(sourceTabs, sourceTabEls) {
  const hiddenTabs = getHiddenTabs(sourceTabs, sourceTabEls);
  const firstHiddenTab = hiddenTabs.first();
  const firstHiddenTabIndex = sourceTabs.indexOf(firstHiddenTab);
  return firstHiddenTabIndex - 1;
}

const SourceTabs = React.createClass({
  propTypes: {
    sourceTabs: ImPropTypes.list,
    selectedSource: ImPropTypes.map,
    selectSource: PropTypes.func.isRequired,
    closeTab: PropTypes.func.isRequired
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

  renderSourcesDropdown() {
    if (!this.state.hiddenSourceTabs) {
      return dom.div({});
    }

    return dom.div({
      className: "sources-dropdown dropdown",
      ref: "sourcesDropdown",
      style: { display: (this.state.dropdownShown ? "block" : "none") }
    },
      dom.ul({}, this.state.hiddenSourceTabs.map(this.renderDropdownSource))
    );
  },

  renderDropdownSource(source) {
    const { selectSource, sourceTabs } = this.props;
    const url = source && source.get("url");
    const filename = getFilename(url);
    const sourceTabEls = this.refs.sourceTabs.children;

    return dom.li({
      key: source.get("id"),
      onClick: () => {
        const tabIndex = getLastVisibleTabIndex(sourceTabs, sourceTabEls);
        selectSource(source.get("id"), { tabIndex });
        this.toggleSourcesDropdown();
      }
    }, filename);
  },

  renderSourcesDropdownButon() {
    const hiddenSourceTabs = this.state.hiddenSourceTabs;
    if (!hiddenSourceTabs || hiddenSourceTabs.size == 0) {
      return dom.div({});
    }

    return dom.span(
      {
        className: "subsettings",
        onClick: this.toggleSourcesDropdown
      },
      dom.img({ src: "images/subSettings.svg" })
    );
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
    const url = source && source.get("url");
    const filename = getFilename(url);
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
        title: url
      },
      dom.div({ className: "filename" }, filename),
      dom.div(
        { onClick: onClickClose },
        dom.span(
          { className: "close-btn" },
          Svg("close")
        )
      )
    );
  },

  render() {
    if (!isEnabled("tabs")) {
      return dom.div({ className: "source-header" });
    }

    return dom.div({ className: "source-header" },
      this.renderSourcesDropdown(),
      this.renderTabs(),
      this.renderSourcesDropdownButon()
    );
  }
});

module.exports = connect(
  state => ({
    selectedSource: getSelectedSource(state),
    sourceTabs: getSourceTabs(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SourceTabs);
