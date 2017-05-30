type AstPosition = { line: number, column: number };

type AstLocation = { end: AstPosition, start: AstPosition };

type Scope = {
  location: AstLocation,
  parent: Scope,
  bindings: Object[]
};
