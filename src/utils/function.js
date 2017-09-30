import { findClosestScope } from "./breakpoint/astBreakpointLocation";
import { correctIndentation } from "./indentation";

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
  const functionText = [firstLine, ...middle, lastLine].join("\n");
  const indentedFunctionText = correctIndentation(functionText);

  return indentedFunctionText;
}
