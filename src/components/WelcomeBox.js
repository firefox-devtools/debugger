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
    const searchSourcesShortcut = formatKeyShortcut(
      L10N.getStr("sources.search.key2")
    );

    const searchProjectShortcut = formatKeyShortcut(
      L10N.getStr("projectTextSearch.key")
    );

    const searchFunctionsShortcut = formatKeyShortcut(
      L10N.getStr("functionSearch.key")
    );

    const searchSourcesLabel = L10N.getStr("welcome.search").substring(2);
    const searchProjectLabel = L10N.getStr("welcome.findInFiles").substring(2);
    const searchFunctionLabel = L10N.getStr("welcome.searchFunction").substring(
      2
    );

    return (
      <div className="welcomebox">
        <div className="alignlabel">
          <div className="shortcutKeys">
            <p>
              {searchSourcesShortcut}
            </p>
            <p>
              {searchProjectShortcut}
            </p>
            <p>
              {searchFunctionsShortcut}
            </p>
          </div>
          <div className="shortcutFunction">
            <p>
              {searchSourcesLabel}
            </p>
            <p>
              {searchProjectLabel}
            </p>
            <p>
              {searchFunctionLabel}
            </p>
          </div>
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
