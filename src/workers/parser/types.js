/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { BabelLocation } from "@babel/types";

export type AstPosition = { line: number, column: number };

export type AstLocation = { end: AstPosition, start: AstPosition };

export type Scope = {
  location: AstLocation,
  parent: Scope,
  bindings: Object[]
};

export type ClassDeclaration = {|
  name: string,
  location: BabelLocation,
  parent?: ClassDeclaration
|};

export type SymbolDeclaration = {|
  name: string,
  expression?: string,
  klass?: ?string,
  location: BabelLocation,
  expressionLocation?: BabelLocation,
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
