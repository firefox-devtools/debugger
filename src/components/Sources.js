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
    selectSource: PropTypes.func.isRequired
  },

  displayName: "Sources",

  render() {
    const { sources, selectSource } = this.props;

    return dom.div(
      { className: "sources-panel" },
      dom.div({ className: "sources-header" },
        L10N.getStr("sources.header"),
        dom.span({ className: "sources-header-info" },
          L10N.getFormatStr("sources.search", formatKeyShortcut("CmdOrCtrl+P"))
        )
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
