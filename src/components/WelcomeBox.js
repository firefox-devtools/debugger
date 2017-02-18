// @flow
const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");

const { getPaneCollapse } = require("../selectors");
const { formatKeyShortcut } = require("../utils/text");
const PaneToggleButton = createFactory(
  require("./shared/Button/PaneToggle")
);

require("./WelcomeBox.css");

const WelcomeBox = React.createClass({
  propTypes: {
    horizontal: PropTypes.bool,
    togglePaneCollapse: PropTypes.func,
    endPanelCollapsed: PropTypes.bool,
  },

  displayName: "WelcomeBox",

  renderToggleButton() {
    if (this.props.horizontal) {
      return;
    }

    return PaneToggleButton({
      position: "end",
      collapsed: !this.props.endPanelCollapsed,
      horizontal: this.props.horizontal,
      handleClick: this.props.togglePaneCollapse
    });
  },

  render() {
    const searchLabel = L10N.getFormatStr("welcome.search",
      formatKeyShortcut(
        `CmdOrCtrl+${L10N.getStr("sources.search.key")}`
      )
    );
    return dom.div(
      { className: "welcomebox" },
      searchLabel,
      this.renderToggleButton()
    );
  }
});

module.exports = connect(
  state => ({
    endPanelCollapsed: getPaneCollapse(state, "end"),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WelcomeBox);
