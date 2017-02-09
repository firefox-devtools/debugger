// @flow
const React = require("react");
const { DOM: dom, PropTypes } = React;
const ImPropTypes = require("react-immutable-proptypes");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const { formatKeyShortcut } = require("../utils/text");
const SourcesTree = React.createFactory(require("./SourcesTree"));
const actions = require("../actions");
const { getSelectedSource, getSources } = require("../selectors");

require("./Sources.css");

const Sources = React.createClass({
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

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state),
    sources: getSources(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
