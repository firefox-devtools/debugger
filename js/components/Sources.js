const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const dom = React.DOM;

require("./Sources.css");

function Sources({ sources, selectSource }) {
  const sourceArr = Object.keys(sources).map(k => sources[k]);

  return dom.ul(
    {className: "sources-pane"},
    sourceArr.map(source => {
      return dom.li({ onClick: () => selectSource(source),
                      className: "sources-pane-item" },
                    source.url ? source.url : source.introductionType);
    })
  );
}

module.exports = connect(
  null,
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
