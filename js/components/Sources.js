"use strict";

const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const dom = React.DOM;

require("./Sources.css");

function Sources({ sources, selectSource }) {
  return dom.ul(
    {className: "sources-pane"},
    sources.valueSeq().map(source => {
      return dom.li({ onClick: () => selectSource(source.toJS()),
                      className: "sources-pane-item" },
                    source.get("url") || source.get("introductionType"));
    })
  );
}

module.exports = connect(
  null,
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
