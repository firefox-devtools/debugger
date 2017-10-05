// @flow
import React from "react";
import ReactDOM from "react-dom";

import { SourceEditor } from "devtools-source-editor";
import CloseButton from "../shared/Button/Close";
import "./ConditionalPanel.css";

function createEditor(input, funcOpts) {
  return new SourceEditor({
    mode: "javascript",
    foldGutter: false,
    enableCodeFolding: false,
    readOnly: false,
    lineNumbers: false,
    theme: "mozilla",
    styleActiveLine: false,
    lineWrapping: false,
    matchBrackets: false,
    showAnnotationRuler: false,
    gutters: [],
    value: " ",
    extraKeys: {
      // Override code mirror keymap to avoid conflicts with split console.
      Esc: false,
      "Cmd-F": false,
      "Cmd-G": false,
      Enter: input => {
        funcOpts.saveAndClose(input);
      }
    }
  });
}

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

  function saveAndClose(input) {
    if (input) {
      if (input.doc) {
        // for codemirror inputs
        setBreakpoint(input.getValue());
      } else {
        setBreakpoint(input.value);
      }
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
    <div className="conditional-breakpoint-panel">
      <div className="prompt">»</div>
      {/* <input
        defaultValue={condition}
        placeholder={L10N.getStr("editor.conditionalPanel.placeholder")}
        onKeyDown={onKey}
        ref={setInput}
      /> */}
      <div className="panel-mount" />
      <CloseButton
        handleClick={closePanel}
        buttonClass="big"
        tooltip={L10N.getStr("editor.conditionalPanel.close")}
      />
    </div>,
    panel
  );

  const funcOpts = { saveAndClose };
  const editor = createEditor(input, funcOpts);
  editor.appendToLocalElement(panel.querySelector(".panel-mount"));

  return panel;
}

export { renderConditionalPanel };
