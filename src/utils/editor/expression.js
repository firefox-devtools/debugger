// @flow

import isEqual from "lodash/isEqual";

const lineOffset = 1;

export function getTokenLocation(codeMirror: any, tokenEl: HTMLElement) {
  const { left, top } = tokenEl.getBoundingClientRect();
  const { line, ch } = codeMirror.coordsChar({ left, top });

  return {
    line: line + lineOffset,
    column: ch
  };
}

export function updateSelection(
  target: HTMLElement,
  editor: any,
  { linesInScope, selection, setSelection, clearSelection }: any
) {
  const location = getTokenLocation(editor.codeMirror, target);
  const tokenText = target.innerText ? target.innerText.trim() : "";
  const cursorPos = target.getBoundingClientRect();

  if (selection) {
    // We are mousing over the same token as before
    if (isEqual(selection.tokenPos, location)) {
      return;
    }

    // We are mousing over a new token that is not in the selection
    if (!target.classList.contains("debug-expression")) {
      clearSelection();
    }
  }

  const invalidToken = tokenText === "" || tokenText.match(/[(){},.;\s]/);
  const invalidTarget =
    (target.parentElement &&
      !target.parentElement.closest(".CodeMirror-line")) ||
    cursorPos.top == 0;
  const isUpdating = selection && selection.updating;
  const inScope = linesInScope.includes(location.line);

  if (invalidTarget || !inScope || isUpdating || invalidToken) {
    return;
  }

  setSelection(tokenText, location, cursorPos);
}
