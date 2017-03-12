// @flow
import { DOM as dom, PropTypes, createClass, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import actions from "../actions";
import { getPaneCollapse } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

const PaneToggleButton = createFactory(
  require("./shared/Button/PaneToggle")
);

require("./WelcomeBox.css");

const WelcomeBox = createClass({
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
