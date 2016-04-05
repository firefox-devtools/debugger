const React = require("react");
const { getSourceText } = require("../queries");
const dom = React.DOM;
const { connect } = require("react-redux");

function Editor({ sourceText }) {
  return dom.pre(
    null,
    sourceText ? sourceText.text : '...'
  );
}

module.exports = connect(
  (state, props) => ({ sourceText: (props.selectedSource ?
                                    getSourceText(state, props.selectedSource.actor) :
                                    null)})
)(Editor);
