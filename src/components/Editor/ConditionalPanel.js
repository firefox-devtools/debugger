// @flow
const React = require("react");
const { DOM: dom } = React;
const Svg = require("../shared/Svg");

const ReactDOM = require("react-dom");

function renderConditionalPanel({ condition, closePanel, setBreakpoint }:
  { condition: boolean, closePanel: Function, setBreakpoint: Function }) {
  let panel = document.createElement("div");

  function onKey(e: SyntheticKeyboardEvent) {
    switch (e.key) {
      case "Enter":
        if (e.target && e.target.value) {
          setBreakpoint(e.target.value);
          closePanel();
        }
        break;
      case "Escape":
        closePanel();
        break;
    }
  }

  const inputA = dom.input({
    defaultValue: condition,
    placeholder: L10N.getStr("editor.conditionalPanel.placeholder"),
    onKeyDown: onKey.bind(this)
  });

  ReactDOM.render(
    dom.div(
      { className: "conditional-breakpoint-panel" },
      Svg('guillemet'),
      inputA,
      dom.a({ onClick: closePanel }, L10N.getStr("editor.conditionalPanel.cancel"))
      // TODO: add 'set' link, and add a state for input and callback for clicking this link.
      // dom.a({}, L10N.getStr("editor.conditionalPanel.setBreakpoint"))
    ),
    panel
  );

  return panel;
}

module.exports = {
  renderConditionalPanel
};
