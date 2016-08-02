const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { getSelectedSource } = require("../selectors");
const Svg = require("./utils/Svg");

function debugBtn(onClick, type, className = "active") {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type)
  );
}

function SourceFooter({ togglePrettyPrint, selectedSource }) {
  const commandsEnabled = selectedSource ? "" : "disabled";

  return dom.div(
    {
      className: "source-footer"
    },
    dom.div({ className: "command-bar" },
      debugBtn(
        () => {},
        "blackBox",
        commandsEnabled
      ),
      debugBtn(
        () => togglePrettyPrint(selectedSource.get("id")),
        "prettyPrint",
        commandsEnabled
      )
    )
  );
}

module.exports = connect(
  state => ({
    selectedSource: getSelectedSource(state),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SourceFooter);
