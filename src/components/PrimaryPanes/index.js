// @flow

import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
import { getSources, getActiveSearch } from "../../selectors";
import { isEnabled } from "devtools-config";
import "./Sources.css";
import classnames from "classnames";

import Outline from "./Outline";
import SourcesTree from "./SourcesTree";

import type { SourcesMap } from "../../reducers/types";
type SourcesState = {
  selectedPane: string
};

type Props = {
  sources: SourcesMap,
  selectSource: (string, Object) => void,
  horizontal: boolean,
  setActiveSearch: string => void,
  closeActiveSearch: () => void,
  sourceSearchOn: boolean
};

class PrimaryPanes extends Component {
  renderSourcesShortcut: Function;
  selectedPane: String;
  showPane: Function;
  renderChildren: Function;
  state: SourcesState;
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { selectedPane: "sources" };

    this.showPane = this.showPane.bind(this);
  }

  showPane(selectedPane: string) {
    this.setState({ selectedPane });
  }

  renderPrimaryPaneTabs() {
    const sources = formatKeyShortcut(L10N.getStr("sources.header"));
    const outline = formatKeyShortcut(L10N.getStr("outline.header"));

    const tabItems = [
      <div
        className={classnames("tab", {
          active: this.state.selectedPane === "sources"
        })}
        onClick={() => this.showPane("sources")}
        key="sources-tab"
      >
        {sources}
      </div>,
      <div
        className={classnames("tab", {
          active: this.state.selectedPane === "outline"
        })}
        onClick={() => this.showPane("outline")}
        key="outline-tab"
      >
        {outline}
      </div>
    ];

    return <div className="source-footer">{tabItems}</div>;
  }

  renderSourcesShortcut() {
    if (this.props.horizontal) {
      const onClick = () => {
        if (this.props.sourceSearchOn) {
          return this.props.closeActiveSearch();
        }
        this.props.setActiveSearch("source");
      };
      return (
        <div className="sources-header">
          <span className="sources-header-info" dir="ltr" onClick={onClick}>
            {L10N.getFormatStr(
              "sources.search",
              formatKeyShortcut(L10N.getStr("sources.search.key2"))
            )}
          </span>
        </div>
      );
    }
  }

  renderSources() {
    const { sources, selectSource } = this.props;
    return (
      <div>
        {this.renderSourcesShortcut()}
        <SourcesTree sources={sources} selectSource={selectSource} />
      </div>
    );
  }

  renderOutline() {
    const { selectSource } = this.props;
    return <Outline selectSource={selectSource} />;
  }

  render() {
    const { selectedPane } = this.state;
    return (
      <div className="sources-panel">
        {isEnabled("outline") ? this.renderPrimaryPaneTabs() : null}
        {selectedPane == "sources"
          ? this.renderSources()
          : this.renderOutline()}
      </div>
    );
  }
}

PrimaryPanes.displayName = "PrimaryPanes";

export default connect(
  state => ({
    sources: getSources(state),
    sourceSearchOn: getActiveSearch(state) === "source"
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(PrimaryPanes);
