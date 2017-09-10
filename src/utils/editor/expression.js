// @flow

import { isEqual } from "lodash";

export function getTokenLocation(codeMirror: any, tokenEl: HTMLElement) {
  const { left, top, width, height } = tokenEl.getBoundingClientRect();
  const { line, ch } = codeMirror.coordsChar({
    left: left + width / 2,
    top: top + height / 2
  });

  return {
    line: line + 1,
    column: ch
  };
}

export function updatePreview(
  target: HTMLElement,
  editor: any,
  { linesInScope, preview, setPreview, clearPreview }: any
) {
  const location = getTokenLocation(editor.codeMirror, target);
  const tokenText = target.innerText ? target.innerText.trim() : "";
  const cursorPos = target.getBoundingClientRect();

  if (preview) {
    // We are mousing over the same token as before
    if (isEqual(preview.tokenPos, location)) {
      return;
    }

    // We are mousing over a new token that is not in the preview
    if (!target.classList.contains("debug-expression")) {
      clearPreview();
    }
  }

  const invalidToken =
    tokenText === "" || tokenText.match(/[(){}\|&%,.;=<>\+-/\*\s]/);
  const invalidTarget =
    (target.parentElement &&
      !target.parentElement.closest(".CodeMirror-line")) ||
    cursorPos.top == 0;
  const isUpdating = preview && preview.updating;
  const inScope = linesInScope && linesInScope.includes(location.line);

  if (invalidTarget || !inScope || isUpdating || invalidToken) {
    return;
  }

  setPreview(tokenText, location, cursorPos);
}
