// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import actions from "../actions";
import { getPaneCollapse } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

import PaneToggleButton from "./shared/Button/PaneToggle";

const { isEnabled } = require("devtools-config");

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
    const keyCombinationOne = formatKeyShortcut(
      L10N.getStr("sources.search.key2")
    );

    const keyCombinationTwo = formatKeyShortcut(
      L10N.getStr("projectTextSearch.key")
    );

    const searchSourcesLabel = L10N.getStr("welcome.search").substring(2);
    const searchProjectLabel = L10N.getStr("welcome.findInFiles").substring(2);

    const keysDisplay = (
      <div className="shortcutKeys">
        <p>
          {keyCombinationOne}
        </p>
        <p>
          {keyCombinationTwo}
        </p>
      </div>
    );

    const infoDisplay = (
      <div className="shortcutFunction">
        <p>
          {searchSourcesLabel}
        </p>
        <p>
          {searchProjectLabel}
        </p>
      </div>
    );

    return (
      <div className="welcomebox">
        <div className="alignlabel">
          {keysDisplay}
          {isEnabled("searchNav") ? infoDisplay : null}
          {this.renderToggleButton()}
        </div>
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
