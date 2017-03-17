// @flow

import { getExpression } from "../parser";

export function getTokenLocation(codeMirror, tokenEl) {
  const lineOffset = 1;
  const { left, top } = tokenEl.getBoundingClientRect();
  const { line, ch } = codeMirror.coordsChar({ left, top });

  return {
    line: line + lineOffset,
    column: ch
  };
}

export async function getExpressionFromToken(
  cm: any, token: HTMLElement, sourceText
) {
  const loc = getTokenLocation(cm, token);
  return await getExpression(sourceText.toJS(), token.textContent || "", loc);
}

export function getThisFromFrame(tokenText, selectedFrame) {
  if ("this" in selectedFrame) {
    return { value: selectedFrame.this };
  }

  return null;
}

export function previewExpression({ expression, variables, tokenText }) {
  if (!tokenText) {
    return null;
  }

  if (tokenText === "this") {
    return getThisFromFrame();
  }

  if (variables.has(tokenText)) {
    return variables.get(tokenText);
  }

  return expression || null;
}
