// @flow
import { DOM as dom, PropTypes, createClass, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ImPropTypes from "react-immutable-proptypes";

import actions from "../actions";
import { getSelectedSource, getSources } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

const SourcesTree = createFactory(require("./SourcesTree"));

require("./Sources.css");

const Sources = createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired,
    horizontal: PropTypes.bool.isRequired,
    toggleFileSearch: PropTypes.func.isRequired
  },

  displayName: "Sources",

  renderShortcut() {
    if (this.props.horizontal) {
      return dom.span(
        {
          className: "sources-header-info",
          dir: "ltr",
          onClick: () => this.props.toggleFileSearch()
        },
        L10N.getFormatStr("sources.search",
          formatKeyShortcut(`CmdOrCtrl+${L10N.getStr("sources.search.key")}`))
      );
    }
  },

  render() {
    const { sources, selectSource } = this.props;

    return dom.div(
      { className: "sources-panel" },
      dom.div({ className: "sources-header" },
        this.renderShortcut()
      ),
      SourcesTree({ sources, selectSource })
    );
  }
});

export default connect(
  state => ({ selectedSource: getSelectedSource(state),
    sources: getSources(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
