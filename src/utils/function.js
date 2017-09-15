import { findClosestScope } from "./breakpoint/astBreakpointLocation";

function getIndentation(lines) {
  const firstLine = lines[0];
  const secondLine = lines[1];
  const lastLine = lines[lines.length - 1];

  const _getIndentation = line => line && line.match(/^\s*/)[0].length;

  const indentations = [
    _getIndentation(firstLine),
    _getIndentation(secondLine),
    _getIndentation(lastLine)
  ];

  return Math.max(...indentations, 0);
}

export function findFunctionText(line, source, symbols) {
  const func = findClosestScope(symbols.functions, { line, column: Infinity });
  if (!func) {
    return null;
  }

  const { location: { start, end } } = func;
  const lines = source.text.split("\n");
  const firstLine = lines[start.line - 1].slice(start.column);
  const lastLine = lines[end.line - 1].slice(0, end.column);
  const middle = lines.slice(start.line, end.line - 1);
  const functionLines = [firstLine, ...middle, lastLine];

  const indentation = getIndentation(functionLines);
  const formattedLines = functionLines.map(_line =>
    _line.replace(new RegExp(`^\\s{0,${indentation - 1}}`), "")
  );

  return formattedLines.join("\n").trim();
}
