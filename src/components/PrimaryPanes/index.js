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
  setPrimaryPaneTab: string => void,
  sources: SourcesMap,
  selectLocation: Object => void,
  horizontal: boolean,
  setActiveSearch: string => void,
  closeActiveSearch: () => void,
  sourceSearchOn: boolean,
  alphabetizeOutline: boolean
};

class PrimaryPanes extends Component<Props, State> {
  renderShortcut: Function;
  selectedPane: String;
  showPane: Function;
  renderTabs: Function;
  renderChildren: Function;
  onAlphabetizeClick: Function;

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
      >
        {sources}
      </div>,
      <div
        className={classnames("tab outline-tab", {
          active: this.props.selectedTab === "outline"
        })}
        onClick={() => this.showPane("outline")}
        key="outline-tab"
      >
        {outline}
      </div>
    ];
  }

  renderTabs = () => {
    return (
      <div className="source-outline-tabs">{this.renderOutlineTabs()}</div>
    );
  };

  renderShortcut = () => {
    if (this.props.horizontal) {
      const onClick = () => {
        if (this.props.sourceSearchOn) {
          return this.props.closeActiveSearch();
        }
        this.props.setActiveSearch("source");
      };
      return (
        <span className="sources-header-info" dir="ltr" onClick={onClick}>
          {L10N.getFormatStr(
            "sources.search",
            formatKeyShortcut(L10N.getStr("sources.search.key2"))
          )}
        </span>
      );
    }
  };

  render() {
    const { selectedTab } = this.props;

    return (
      <div className="sources-panel">
        {this.renderTabs()}
        {selectedTab === "sources" ? (
          <SourcesTree />
        ) : (
          <Outline
            alphabetizeOutline={this.state.alphabetizeOutline}
            onAlphabetizeClick={this.onAlphabetizeClick}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedTab: getSelectedPrimaryPaneTab(state),
  sources: getSources(state),
  sourceSearchOn: getActiveSearch(state) === "source"
});

export default connect(mapStateToProps, actions)(PrimaryPanes);
