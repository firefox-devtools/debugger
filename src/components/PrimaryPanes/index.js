// @flow

import { DOM as dom, Component, createFactory } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formatKeyShortcut } from "../../utils/text";
import actions from "../../actions";
import { getSources, getActiveSearchState } from "../../selectors";
import { isEnabled } from "devtools-config";
import "./Sources.css";
import classnames from "classnames";

import _Outline from "./Outline";
const Outline = createFactory(_Outline);

import _SourcesTree from "./SourcesTree";
const SourcesTree = createFactory(_SourcesTree);

import type { SourcesMap } from "../../reducers/types";
type SourcesState = {
  selectedPane: string
};

type State = SourcesState;
type Props = {
  sources: SourcesMap,
  selectSource: (string, Object) => void,
  horizontal: boolean,
  setActiveSearch: string => void,
  closeActiveSearch: () => void,
  sourceSearchOn: boolean
};

class PrimaryPanes extends Component<Props, State> {
  renderShortcut: Function;
  selectedPane: String;
  showPane: Function;
  renderFooter: Function;
  renderChildren: Function;

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

    return [
      dom.div(
        {
          className: classnames("tab", {
            active: this.state.selectedPane === "sources"
          }),
          onClick: () => this.showPane("sources"),
          key: "sources-tab"
        },
        "Sources View"
      ),
      dom.div(
        {
          className: classnames("tab", {
            active: this.state.selectedPane === "outline"
          }),
          onClick: () => this.showPane("outline"),
          key: "outline-tab"
        },
        "Outline View"
      )
    ];
  }

  renderFooter() {
    return dom.div(
      {
        className: "source-footer"
      },
      this.renderOutlineTabs()
    );
  }

  renderShortcut() {
    if (this.props.horizontal) {
      return dom.span(
        {
          className: "sources-header-info",
          dir: "ltr",
          onClick: () => {
            if (this.props.sourceSearchOn) {
              return this.props.closeActiveSearch();
            }
            this.props.setActiveSearch("source");
          }
        },
        L10N.getFormatStr(
          "sources.search",
          formatKeyShortcut(L10N.getStr("sources.search.key2"))
        )
      );
    }
  }

  renderHeader() {
    return dom.div({ className: "sources-header" }, this.renderShortcut());
  }

  render() {
    const { selectedPane } = this.state;
    const { sources, selectSource } = this.props;

    return dom.div(
      { className: "sources-panel" },
      this.renderHeader(),
      SourcesTree({
        sources,
        selectSource,
        isHidden: selectedPane === "outline"
      }),
      Outline({ selectSource, isHidden: selectedPane === "sources" }),
      this.renderFooter()
    );
  }
}

PrimaryPanes.displayName = "PrimaryPanes";

export default connect(
  state => ({
    sources: getSources(state),
    sourceSearchOn: getActiveSearchState(state) === "source"
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(PrimaryPanes);
