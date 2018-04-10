// @flow

import { isReliableScope } from "./isReliableScope";
import { buildGeneratedBindingList } from "./buildGeneratedBindingList";
import { findGeneratedBinding } from "./findGeneratedBinding";
import { generateClientScope } from "./generateClientScope";

import type {
  Frame,
  Scope,
  Source,
  BindingContents,
  ScopeBindings
} from "../../../types";

export async function buildMappedScopes(
  source: Source,
  frame: Frame,
  originalAstScopes: Scope,
  generatedAstScopes: Scope,
  scopes: Scope,
  sourceMaps: any,
  client: any
): Promise<?{
  mappings: {
    [string]: string
  },
  scope: OriginalScope
}> {
  const generatedAstBindings = buildGeneratedBindingList(
    scopes,
    generatedAstScopes,
    frame.this
  );

  const expressionLookup = {};
  const mappedOriginalScopes = [];

  for (const item of originalAstScopes) {
    const generatedBindings = {};

    for (const name of Object.keys(item.bindings)) {
      const binding = item.bindings[name];

      const result = await findGeneratedBinding(
        sourceMaps,
        client,
        source,
        name,
        binding,
        generatedAstBindings
      );

      if (result) {
        generatedBindings[name] = result.grip;

        if (
          binding.refs.length !== 0 &&
          // These are assigned depth-first, so we don't want shadowed
          // bindings in parent scopes overwriting the expression.
          !Object.prototype.hasOwnProperty.call(expressionLookup, name)
        ) {
          expressionLookup[name] = result.expression;
        }
      }
    }

    mappedOriginalScopes.push({
      ...item,
      generatedBindings
    });
  }

  const mappedGeneratedScopes = generateClientScope(
    scopes,
    mappedOriginalScopes
  );

  return isReliableScope(mappedGeneratedScopes)
    ? { mappings: expressionLookup, scope: mappedGeneratedScopes }
    : null;
}
