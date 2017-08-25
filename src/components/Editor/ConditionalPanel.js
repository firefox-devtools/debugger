// @flow
import { DOM as dom } from "react";
import ReactDOM from "react-dom";

import CloseButton from "../shared/Button/Close";
import "./ConditionalPanel.css";

function renderConditionalPanel({
  condition,
  closePanel,
  setBreakpoint
}: {
  condition: ?string,
  closePanel: Function,
  setBreakpoint: Function
}) {
  const panel = document.createElement("div");
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

export { renderConditionalPanel };
