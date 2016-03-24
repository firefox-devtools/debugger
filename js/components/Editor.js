const React = require("react");
const { getSourceText } = require("../queries");
const dom = React.DOM;
const { connect } = require("react-redux");

function Editor({ sourceText }) {
  return dom.pre(
    null,
    sourceText.text
  );
}

module.exports = connect(
  (state, props) => ({ sourceText: getSourceText(state, props.selectedSource.actor) })
)(Editor);
