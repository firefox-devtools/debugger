/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { traverseAst } from "./utils/ast";
import {
  createParseJSScopeVisitor,
  findScopes,
  type SourceScope
} from "./visitor";

import type { Location } from "../../types";

let parsedScopesCache = new Map();

export default function getScopes(location: Location): SourceScope[] {
  const { sourceId } = location;
  let parsedScopes = parsedScopesCache.get(sourceId);
  if (!parsedScopes) {
    const visitor = createParseJSScopeVisitor(sourceId);
    traverseAst(sourceId, visitor.traverseVisitor);
    parsedScopes = visitor.toParsedScopes();
    parsedScopesCache.set(sourceId, parsedScopes);
  }
  return findScopes(parsedScopes, location);
}

export function clearScopes() {
  parsedScopesCache = new Map();
}
