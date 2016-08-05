const React = require("react");
const { DOM: dom } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const actions = require("../actions");
const { isEnabled } = require("../feature");
const { getSelectedSource } = require("../selectors");
const Svg = require("./utils/Svg");

function debugBtn(onClick, type, className = "active", tooltip) {
  className = `${type} ${className}`;
  return dom.span(
    { onClick, className, key: type },
    Svg(type, { title: tooltip })
  );
}

function SourceFooter({ togglePrettyPrint, selectedSource }) {
  const commandsEnabled = selectedSource ? "" : "disabled";

  return dom.div(
    {
      className: "source-footer"
    },
    dom.div({ className: "command-bar" },
      isEnabled("features.blackbox") ? debugBtn(
        () => {},
        "blackBox",
        commandsEnabled,
        "Toggle Black Boxing"
      ) : null,
      debugBtn(
        () => togglePrettyPrint(selectedSource.get("id")),
        "prettyPrint",
        commandsEnabled,
        "Prettify Source"
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
