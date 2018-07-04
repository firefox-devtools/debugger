/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
import {
  getSources,
  getActiveSearch,
  getSelectedPrimaryPaneTab
} from "../../selectors";
import { features, prefs } from "../../utils/prefs";
import "./Sources.css";
import classnames from "classnames";

import Outline from "./Outline";
import SourcesTree from "./SourcesTree";

import type { SourcesMap } from "../../reducers/types";

type State = {
  alphabetizeOutline: boolean
};

type Props = {
  selectedTab: string,
  sources: SourcesMap,
  horizontal: boolean,
  sourceSearchOn: boolean,
  setPrimaryPaneTab: string => void,
  selectLocation: Object => void,
  setActiveSearch: string => void,
  closeActiveSearch: () => void
};

class PrimaryPanes extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      alphabetizeOutline: prefs.alphabetizeOutline
    };
  }

  showPane = (selectedPane: string) => {
    this.props.setPrimaryPaneTab(selectedPane);
  };

  onAlphabetizeClick = () => {
    const alphabetizeOutline = !prefs.alphabetizeOutline;
    prefs.alphabetizeOutline = alphabetizeOutline;
    this.setState({ alphabetizeOutline });
  };

  renderOutlineTabs() {
    if (!features.outline) {
      return;
    }

    const sources = formatKeyShortcut(L10N.getStr("sources.header"));
    const outline = formatKeyShortcut(L10N.getStr("outline.header"));

    return [
      <div
        className={classnames("tab sources-tab", {
          active: this.props.selectedTab === "sources"
        })}
        onClick={() => this.showPane("sources")}
        key="sources-tab"
        role="tab"
      >
        {sources}
      </div>,
      <div
        className={classnames("tab outline-tab", {
          active: this.props.selectedTab === "outline"
        })}
        onClick={() => this.showPane("outline")}
        key="outline-tab"
        role="tab"
      >
        {outline}
      </div>
    ];
  }

  renderTabs = () => {
    return (
      <div className="source-outline-tabs" role="tablist">
        {this.renderOutlineTabs()}
      </div>
    );
  };

  render() {
    const { selectedTab } = this.props;

    return (
      <div className="sources-panel">
        {this.renderTabs()}
        <div role="tabpanel">
          {selectedTab === "sources" ? (
            <SourcesTree />
          ) : (
            <Outline
              alphabetizeOutline={this.state.alphabetizeOutline}
              onAlphabetizeClick={this.onAlphabetizeClick}
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedTab: getSelectedPrimaryPaneTab(state),
  sources: getSources(state),
  sourceSearchOn: getActiveSearch(state) === "source"
});

export default connect(mapStateToProps, {
  setPrimaryPaneTab: actions.setPrimaryPaneTab,
  selectLocation: actions.selectLocation,
  setActiveSearch: actions.setActiveSearch,
  closeActiveSearch: actions.closeActiveSearch
})(PrimaryPanes);
