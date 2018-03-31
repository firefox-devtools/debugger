/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export type AstPosition = { line: number, column: number };
export type AstLocation = { end: AstPosition, start: AstPosition };

export type ClassDeclaration = {|
  name: string,
  location: AstLocation,
  parent?: ClassDeclaration
|};

export type SymbolDeclaration = {|
  name: string,
  expression?: string,
  klass?: ?string,
  location: AstLocation,
  expressionLocation?: AstLocation,
  parameterNames?: string[],
  identifier?: Object,
  computed?: Boolean,
  values?: string[]
|};

export type FunctionDeclaration = SymbolDeclaration & {|
  parameterNames: string[]
|};

export type SymbolDeclarations = {
  classes: Array<ClassDeclaration>,
  functions: Array<SymbolDeclaration>,
  variables: Array<SymbolDeclaration>,
  memberExpressions: Array<SymbolDeclaration>,
  callExpressions: Array<SymbolDeclaration>,
  objectProperties: Array<SymbolDeclaration>,
  identifiers: Array<SymbolDeclaration>,
  comments: Array<SymbolDeclaration>
};

export type PausePoint = {
  location: AstPosition,
  types: { breakpoint: boolean, stepOver: boolean }
};
