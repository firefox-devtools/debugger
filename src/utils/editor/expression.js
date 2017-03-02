// @flow

import { getVisibleVariablesFromScope } from "../scopes";
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

export async function getSelectedExpression(cm: any, token: HTMLElement, {
  selectedFrame, pauseData, sourceText
}) {
  const tokenText = token.textContent;

  if (!tokenText) {
    return null;
  }

  if (tokenText == "this" && ("this" in selectedFrame)) {
    return { value: selectedFrame.this };
  }

  const variables = getVisibleVariablesFromScope(pauseData, selectedFrame);
  if (variables.has(tokenText)) {
    return variables.get(tokenText);
  }

  const expression = await getExpressionFromToken(cm, token, sourceText);

  return expression || null;
}
