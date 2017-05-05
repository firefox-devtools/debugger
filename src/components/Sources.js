// @flow

import { DOM as dom, PropTypes, Component, createFactory } from "react";
import ImPropTypes from "react-immutable-proptypes";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { formatKeyShortcut } from "../utils/text";
import actions from "../actions";
import { getSources } from "../selectors";
import "./Sources.css";

import _Outline from "./Outline";
const Outline = createFactory(_Outline);

import _SourcesTree from "./SourcesTree";
const SourcesTree = createFactory(_SourcesTree);

class Sources extends Component {
  renderShortcut: Function;

  constructor(props) {
    super(props);
    this.renderShortcut = this.renderShortcut.bind(this);
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
          formatKeyShortcut(L10N.getStr("sources.search.key"))
        )
      );
    }
  }

  render() {
    const { sources, selectSource } = this.props;

    return dom.div(
      { className: "sources-panel" },
      dom.div({ className: "sources-header" }, this.renderShortcut()),
      SourcesTree({ sources, selectSource }),
      Outline({})
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
