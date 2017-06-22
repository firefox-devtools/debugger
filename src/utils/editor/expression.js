// @flow
const lineOffset = 1;

export function getTokenLocation(codeMirror: any, tokenEl: HTMLElement) {
  const { left, top } = tokenEl.getBoundingClientRect();
  const { line, ch } = codeMirror.coordsChar({ left, top });

  return {
    line: line + lineOffset,
    column: ch
  };
}

export function markExpression(cm: any, location: any) {
  const { start, end } = location;
  const { doc } = cm.editor;

  return doc.markText(
    { ch: start.column, line: start.line - lineOffset },
    { ch: end.column, line: end.line - lineOffset },
    { className: "selected-token" }
  );
}
