// @flow

import { resolveToken as resolveTokenFromParser } from "../parser";
import type { Expression, Frame, SourceText } from "../../types";
import type { Record } from "../makeRecord";

export function getTokenLocation(codeMirror: any, tokenEl: HTMLElement) {
  const lineOffset = 1;
  const { left, top } = tokenEl.getBoundingClientRect();
  const { line, ch } = codeMirror.coordsChar({ left, top });

  return {
    line: line + lineOffset,
    column: ch
  };
}

export async function resolveToken(
  cm: any,
  token: HTMLElement,
  sourceText: Record<SourceText>,
  frame: Frame
) {
  const loc = getTokenLocation(cm, token);
  return await resolveTokenFromParser(
    sourceText.toJS(),
    token.textContent || "",
    loc,
    frame
  );
}

export function getThisFromFrame(selectedFrame: Frame) {
  if ("this" in selectedFrame) {
    return { value: selectedFrame.this };
  }

  return null;
}

// TODO Better define the value for `variables` map once we do it in
// debugger-html
type PreviewExpressionArgs = {
  expression: Expression,
  selectedFrame: Frame,
  tokenText: string,
  variables: Map<string | null, Object>
};

export function previewExpression(
  { expression, selectedFrame, variables, tokenText }: PreviewExpressionArgs
) {
  if (!tokenText) {
    return null;
  }

  if (tokenText === "this") {
    return getThisFromFrame(selectedFrame);
  }

  if (variables.has(tokenText)) {
    return variables.get(tokenText);
  }

  return expression || null;
}
