export function findBestMatchExpression(symbols, tokenPos, token) {
  const { memberExpressions, identifiers } = symbols;
  const { line, column } = tokenPos;
  return identifiers.concat(memberExpressions).reduce((found, expression) => {
    const overlaps =
      expression.location.start.line == line &&
      expression.location.start.column <= column &&
      expression.location.end.column >= column &&
      !expression.computed;

    if (overlaps) {
      return expression;
    }

    return found;
  }, {});
}
