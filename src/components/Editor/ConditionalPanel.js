// @flow
const React = require("react");
const { DOM: dom } = React;

const ReactDOM = require("react-dom");
const CloseButton = require("../shared/Button/Close");

require("./ConditionalPanel.css");

function renderConditionalPanel({ condition, closePanel, setBreakpoint }:
  { condition: boolean, closePanel: Function, setBreakpoint: Function }) {
  let panel = document.createElement("div");

  function onKey(e: SyntheticKeyboardEvent) {
    if (e.key != "Enter") {
      return;
    }

    if (e.target && e.target.value) {
      setBreakpoint(e.target.value);
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
        onKeyPress: onKey
      }),
      CloseButton({
        handleClick: closePanel,
        buttonClass: "big"
      })
    ),
    panel
  );

  return panel;
}

module.exports = {
  renderConditionalPanel
};
