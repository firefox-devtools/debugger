// @flow

import { isReliableScope } from "./isReliableScope";
import { buildGeneratedBindingList } from "./buildGeneratedBindingList";
import { findGeneratedBinding } from "./findGeneratedBinding";
import { generateClientScope } from "./generateClientScope";
import { flatMap, uniqBy } from "lodash";
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

  const generatedLocations = await getGeneratedPositions(
    originalAstScopes,
    source,
    sourceMaps
  );

  for (const item of originalAstScopes) {
    const generatedBindings = {};

    for (const name of Object.keys(item.bindings)) {
      const binding = item.bindings[name];

      const result = await findGeneratedBinding(
        generatedLocations,
        client,
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

async function getGeneratedPositions(originalAstScopes, source, sourceMaps) {
  const scopes = Object.values(originalAstScopes);
  const bindings = flatMap(scopes, ({ bindings }) => Object.values(bindings));
  const refs = flatMap(bindings, ({ refs }) => refs);

  const locations = refs.reduce((positions, ref) => {
    positions.push(ref.start);
    positions.push(ref.end);
    if (ref.declaration) {
      positions.push(ref.declaration.start);
      positions.push(ref.declaration.end);
    }
    return positions;
  }, []);

  const originalLocations = uniqBy(locations, loc =>
    Object.values(loc).join("-")
  );

  let sourcesMap = { [source.id]: source.url };
  return sourceMaps.batchGeneratedLocations(originalLocations, sourcesMap);
}
