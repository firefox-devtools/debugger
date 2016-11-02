const React = require("react");
const { DOM: dom } = React;

const ReactDOM = require("react-dom");

function renderConditionalPanel({ condition, closePanel, setBreakpoint }) {
  let panel = document.createElement("div");

  function onKey(e) {
    if (e.key != "Enter") {
      return;
    }

    setBreakpoint(e.target.value);
    closePanel();
  }

  ReactDOM.render(
    dom.div(
      { className: "conditional-breakpoint-panel" },
      dom.input({
        defaultValue: condition,
        placeholder: "This breakpoint will pause when the expression is true",
        onKeyPress: onKey
      })
    ),
    panel
  );

  return panel;
}

module.exports = {
  renderConditionalPanel
};
