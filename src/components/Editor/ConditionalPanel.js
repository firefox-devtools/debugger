// @flow
const React = require("react");
const { DOM: dom } = React;

const ReactDOM = require("react-dom");
const CloseButton = require("../shared/Button/Close").default;

require("./ConditionalPanel.css");

function renderConditionalPanel({ condition, closePanel, setBreakpoint }:
  { condition: ?string, closePanel: Function, setBreakpoint: Function }) {
  let panel = document.createElement("div");
  let input = null;

  function setInput(node) {
    input = node;
  }

  function saveAndClose() {
    if (input) {
      setBreakpoint(input.value);
    }

    closePanel();
  }

  function onKey(e: SyntheticKeyboardEvent) {
    if (e.key === "Enter") {
      saveAndClose();
    } else if (e.key === "Escape") {
      closePanel();
    }
  }

  ReactDOM.render(
    dom.div(
      { className: "conditional-breakpoint-panel" },
      dom.div({ className: "prompt" }, "»"),
      dom.input({
        defaultValue: condition,
        placeholder: L10N.getStr("editor.conditionalPanel.placeholder"),
        onKeyDown: onKey,
        ref: setInput
      }),
      CloseButton({
        handleClick: closePanel,
        buttonClass: "big",
        tooltip: L10N.getStr("editor.conditionalPanel.close")
      })
    ),
    panel
  );

  return panel;
}

module.exports = {
  renderConditionalPanel
};
