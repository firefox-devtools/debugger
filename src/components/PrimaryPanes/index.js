/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
import {
  getSources,
  getActiveSearch,
  getSelectedPrimaryPaneTab
} from "../../selectors";
import { isEnabled } from "devtools-config";
import "./Sources.css";
import classnames from "classnames";

import Outline from "./Outline";
import SourcesTree from "./SourcesTree";

import type { SourcesMap } from "../../reducers/types";

type Props = {
  selectedTab: string,
  setPrimaryPaneTab: string => void,
  sources: SourcesMap,
  selectSource: (string, Object) => void,
  horizontal: boolean,
  setActiveSearch: string => void,
  closeActiveSearch: () => void,
  sourceSearchOn: boolean
};

class PrimaryPanes extends Component<Props> {
  renderShortcut: Function;
  selectedPane: String;
  showPane: Function;
  renderTabs: Function;
  renderChildren: Function;

  constructor(props: Props) {
    super(props);

    this.renderShortcut = this.renderShortcut.bind(this);
    this.showPane = this.showPane.bind(this);
    this.renderTabs = this.renderTabs.bind(this);
  }

  showPane(selectedPane: string) {
    this.props.setPrimaryPaneTab(selectedPane);
  }

  renderOutlineTabs() {
    if (!isEnabled("outline")) {
      return;
    }

    const sources = formatKeyShortcut(L10N.getStr("sources.header"));

    const outline = formatKeyShortcut(L10N.getStr("outline.header"));

    return [
      <div
        className={classnames("tab", {
          active: this.props.selectedTab === "sources"
        })}
        onClick={() => this.showPane("sources")}
        key="sources-tab"
      >
        {sources}
      </div>,
      <div
        className={classnames("tab", {
          active: this.props.selectedTab === "outline"
        })}
        onClick={() => this.showPane("outline")}
        key="outline-tab"
      >
        {outline}
      </div>
    ];
  }

  renderTabs() {
    return (
      <div className="source-outline-tabs">{this.renderOutlineTabs()}</div>
    );
  }

  renderShortcut() {
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
  }

  renderOutline() {
    const { selectSource } = this.props;

    const outlineComp = isEnabled("outline") ? (
      <Outline selectSource={selectSource} />
    ) : null;

    return outlineComp;
  }

  renderSources() {
    const { sources, selectSource } = this.props;
    return <SourcesTree sources={sources} selectSource={selectSource} />;
  }

  render() {
    const { selectedTab } = this.props;

    return (
      <div className="sources-panel">
        {this.renderTabs()}
        {selectedTab === "sources"
          ? this.renderSources()
          : this.renderOutline()}
      </div>
    );
  }
}

export default connect(
  state => ({
    selectedTab: getSelectedPrimaryPaneTab(state),
    sources: getSources(state),
    sourceSearchOn: getActiveSearch(state) === "source"
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(PrimaryPanes);
