export type AstPosition = { line: number, column: number };

export type AstLocation = { end: AstPosition, start: AstPosition };

export type Scope = {
  location: AstLocation,
  parent: Scope,
  bindings: Object[]
};

export type { SymbolDeclaration, SymbolDeclarations } from "./getSymbols";
