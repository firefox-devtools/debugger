/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
  setActiveSearch: (?ActiveSearchType) => any,
  openQuickOpen: (query?: string) => void
};

class WelcomeBox extends Component<Props> {
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
    const { setActiveSearch, openQuickOpen } = this.props;

    return (
      <div className="welcomebox">
        <div className="alignlabel small-size-layout">
          <div className="shortcutFunction">
            <p onClick={() => openQuickOpen()}>
              <span className="shortcutKey">{searchSourcesShortcut}</span>
              {searchSourcesLabel}
            </p>
            <p onClick={setActiveSearch.bind(null, "project")}>
              <span className="shortcutKey">{searchProjectShortcut}</span>
              {searchProjectLabel}
            </p>
          </div>
          {this.renderToggleButton()}
        </div>
        <div className="alignlabel normal-layout">
          <div className="shortcutKeys">
            <p onClick={() => openQuickOpen()}>{searchSourcesShortcut}</p>
            <p onClick={setActiveSearch.bind(null, "project")}>
              {searchProjectShortcut}
            </p>
          </div>
          <div className="shortcutFunction">
            <p onClick={() => openQuickOpen()}>{searchSourcesLabel}</p>
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
