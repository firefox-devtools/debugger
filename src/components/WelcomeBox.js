// @flow
import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import actions from "../actions";
import { getPaneCollapse } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

import PaneToggleButton from "./shared/Button/PaneToggle";
import type { ActiveSearchType } from "../reducers/ui";

import "./WelcomeBox.css";

type Props = {
  horizontal: boolean,
  togglePaneCollapse: Function,
  endPanelCollapsed: boolean,
  setActiveSearch: (?ActiveSearchType) => any
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

    const searchSourcesLabel = L10N.getStr("welcome.search").substring(2);
    const searchProjectLabel = L10N.getStr("welcome.findInFiles").substring(2);
    const { setActiveSearch } = this.props;

    return (
      <div className="welcomebox">
        <div className="alignlabel small-size-layout">
          <div className="shortcutFunction">
            <p onClick={setActiveSearch.bind(null, "source")}>
              <div className="shortcutKey">{searchSourcesShortcut}</div>
              {searchSourcesLabel}
            </p>
            <p onClick={setActiveSearch.bind(null, "project")}>
              <div className="shortcutKey">{searchProjectShortcut}</div>
              {searchProjectLabel}
            </p>
          </div>
          {this.renderToggleButton()}
        </div>
        <div className="alignlabel normal-layout">
          <div className="shortcutKeys">
            <p onClick={setActiveSearch.bind(null, "source")}>
              {searchSourcesShortcut}
            </p>
            <p onClick={setActiveSearch.bind(null, "project")}>
              {searchProjectShortcut}
            </p>
          </div>
          <div className="shortcutFunction">
            <p onClick={setActiveSearch.bind(null, "source")}>
              {searchSourcesLabel}
            </p>
            <p onClick={setActiveSearch.bind(null, "project")}>
              {searchProjectLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    endPanelCollapsed: getPaneCollapse(state, "end")
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WelcomeBox);
