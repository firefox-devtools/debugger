// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formatKeyShortcut } from "../utils/text";
import actions from "../actions";
import Svg from "./shared/Svg";
import { getSources } from "../selectors";
import "./Sources.css";

import _Outline from "./Outline";
const Outline = createFactory(_Outline);

import _SourcesTree from "./SourcesTree";
const SourcesTree = createFactory(_SourcesTree);

type SourcesState = {
  selectedPane: string
};

class Sources extends Component {
  renderShortcut: Function;
  selectedPane: String;
  togglePane: Function;
  renderFooter: Function;
  renderChildren: Function;
  state: SourcesState;

  constructor(props) {
    super(props);
    this.state = { selectedPane: "sources" };

    this.renderShortcut = this.renderShortcut.bind(this);
    this.togglePane = this.togglePane.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
  }

  togglePane() {
    const selectedPane = this.state.selectedPane === "sources"
      ? "outline"
      : "sources";

    this.setState({ selectedPane });
  }

  renderFooter() {
    const { selectedPane } = this.state;
    const showSourcesTooltip = L10N.getStr("sourcesPane.showSourcesTooltip");
    const showOutlineTooltip = L10N.getStr("sourcesPane.showOutlineTooltip");
    const tooltip = selectedPane === "sources"
      ? showOutlineTooltip
      : showSourcesTooltip;
    const type = selectedPane === "sources" ? "showSources" : "showOutline";

    return dom.div(
      {
        className: "source-footer"
      },
      dom.div(
        { className: "commands" },
        dom.button(
          {
            className: "action",
            onClick: this.togglePane,
            key: type,
            title: tooltip
          },
          Svg(type)
        )
      )
    );
  }

  renderShortcut() {
    if (this.props.horizontal) {
      return dom.span(
        {
          className: "sources-header-info",
          dir: "ltr",
          onClick: () => this.props.toggleProjectSearch()
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

Sources.propTypes = {
  sources: ImPropTypes.map.isRequired,
  selectSource: PropTypes.func.isRequired,
  horizontal: PropTypes.bool.isRequired,
  toggleProjectSearch: PropTypes.func.isRequired
};

Sources.displayName = "Sources";

export default connect(
  state => ({
    sources: getSources(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
