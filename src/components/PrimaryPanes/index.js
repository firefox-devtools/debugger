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
  renderShortcut: Function;
  selectedPane: String;
  showPane: Function;
  renderFooter: Function;
  renderChildren: Function;
  state: SourcesState;
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { selectedPane: "sources" };

    this.renderShortcut = this.renderShortcut.bind(this);
    this.showPane = this.showPane.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  showPane(selectedPane: string) {
    this.setState({ selectedPane });
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
  }

  renderFooter() {
    return <div className="source-footer">{this.renderOutlineTabs()}</div>;
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

  renderHeader() {
    return <div className="sources-header">{this.renderShortcut()}</div>;
  }

  render() {
    const { selectedPane } = this.state;
    const { sources, selectSource } = this.props;

    const outlineComp = isEnabled("outline") ? (
      <Outline
        selectSource={selectSource}
        isHidden={selectedPane === "sources"}
      />
    ) : null;

    return (
      <div className="sources-panel">
        {this.renderHeader()}
        <SourcesTree
          sources={sources}
          selectSource={selectSource}
          isHidden={selectedPane === "outline"}
        />
        {outlineComp}
        {this.renderFooter()}
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
