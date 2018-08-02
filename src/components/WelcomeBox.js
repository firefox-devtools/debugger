/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { Component } from "react";

import { connect } from "react-redux";

import actions from "../actions";
import { getPaneCollapse } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

import { PaneToggleButton } from "./shared/Button";
import type { ActiveSearchType } from "../reducers/ui";

import "./WelcomeBox.css";

type Props = {
  horizontal: boolean,
  endPanelCollapsed: boolean,
  togglePaneCollapse: Function,
  setActiveSearch: (?ActiveSearchType) => any,
  openQuickOpen: (query?: string) => void
};

export class WelcomeBox extends Component<Props> {
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
        <div className="alignlabel">
          <div className="shortcutFunction">
            <p
              className="welcomebox__searchSources"
              role="button"
              tabIndex="0"
              onClick={() => openQuickOpen()}
            >
              <span className="shortcutKey">{searchSourcesShortcut}</span>
              <span className="shortcutLabel">{searchSourcesLabel}</span>
            </p>
            <p
              className="welcomebox__searchProject"
              role="button"
              tabIndex="0"
              onClick={setActiveSearch.bind(null, "project")}
            >
              <span className="shortcutKey">{searchProjectShortcut}</span>
              <span className="shortcutLabel">{searchProjectLabel}</span>
            </p>
          </div>
          {this.renderToggleButton()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  endPanelCollapsed: getPaneCollapse(state, "end")
});

export default connect(
  mapStateToProps,
  {
    togglePaneCollapse: actions.togglePaneCollapse,
    setActiveSearch: actions.setActiveSearch,
    openQuickOpen: actions.openQuickOpen
  }
)(WelcomeBox);
