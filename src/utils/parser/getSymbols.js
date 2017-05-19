import { getAst } from "./utils/ast";
import traverse from "babel-traverse";
import { isVariable, isFunction } from "./utils/helpers";
import isEmpty from "lodash/isEmpty";
import * as t from "babel-types";

import getFunctionName from "./utils/getFunctionName";

const symbolDeclarations = new Map();

export type ASTLocation = {
  start: {
    line: number,
    column: number
  },
  end: {
    line: number,
    column: number
  }
};

export type SymbolDeclaration = {
  name: string,
  location: ASTLocation,
  parameterNames?: string[]
};

export type SymbolDeclarations = {
  functions: Array<SymbolDeclaration>,
  variables: Array<SymbolDeclaration>
};

function getVariableNames(path): SymbolDeclaration[] {
  if (t.isObjectProperty(path) && !isFunction(path.node.value)) {
    return [
      {
        name: path.node.key.name,
        location: path.node.loc
      }
    ];
  }

  if (!path.node.declarations) {
    return path.node.params.map(dec => ({
      name: dec.name,
      location: dec.loc
    }));
  }

  return path.node.declarations.map(dec => ({
    name: dec.id.name,
    location: dec.loc
  }));
}

export default function getSymbols(source: SourceText): SymbolDeclarations {
  if (symbolDeclarations.has(source.id)) {
    const symbols = symbolDeclarations.get(source.id);
    if (symbols) {
      return symbols;
    }
  }

  const ast = getAst(source);

  const symbols = { functions: [], variables: [] };

  if (isEmpty(ast)) {
    return symbols;
  }

  traverse(ast, {
    enter(path) {
      if (isVariable(path)) {
        symbols.variables.push(...getVariableNames(path));
      }

      if (isFunction(path)) {
        symbols.functions.push({
          name: getFunctionName(path),
          location: path.node.loc
        });
      }

      if (t.isClassDeclaration(path)) {
        symbols.variables.push({
          name: path.node.id.name,
          location: path.node.loc
        });
      }
    }
  });

  symbolDeclarations.set(source.id, symbols);
  return symbols;
}
