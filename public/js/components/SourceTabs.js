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

  renderSourcesDropdownButton() {
    const hiddenSourceTabs = this.state.hiddenSourceTabs;
    if (!hiddenSourceTabs || hiddenSourceTabs.size == 0) {
      return dom.div({});
    }

    return dom.span(
      {
        className: "subsettings",
        onClick: this.toggleSourcesDropdown
      },
      Svg("subSettings")
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
