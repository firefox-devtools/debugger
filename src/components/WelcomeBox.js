// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import actions from "../actions";
import { getPaneCollapse } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

import PaneToggleButton from "./shared/Button/PaneToggle";

import "./WelcomeBox.css";

type Props = {
  horizontal: boolean,
  togglePaneCollapse: Function,
  endPanelCollapsed: boolean
};

class WelcomeBox extends Component {
  props: Props;

  renderToggleButton() {
    const { horizontal, endPanelCollapsed, togglePaneCollapse } = this.props;
    if (horizontal) {
      return;
    }

    return (
      <PaneToggleButton
        position="end"
        collapsed={!endPanelCollapsed}
        horizontal={horizontal}
        handleClick={togglePaneCollapse}
      />
    );
  }

  render() {
    const searchSourcesLabel = L10N.getFormatStr(
      "welcome.search",
      formatKeyShortcut(L10N.getStr("sources.search.key2"))
    );

    const searchProjectLabel = L10N.getFormatStr(
      "welcome.findInFiles",
      formatKeyShortcut(L10N.getStr("projectTextSearch.key"))
    );

    return (
      <div className="welcomebox">
        <div>
          {searchSourcesLabel}
        </div>
        <div>
          {searchProjectLabel}
        </div>
        {this.renderToggleButton()}
      </div>
    );
  }
}

WelcomeBox.displayName = "WelcomeBox";

export default connect(
  state => ({
    endPanelCollapsed: getPaneCollapse(state, "end")
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WelcomeBox);
