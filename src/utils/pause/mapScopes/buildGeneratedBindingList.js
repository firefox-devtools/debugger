// @flow
import { has } from "lodash";
import { locColumn } from "./locColumn";

export function buildGeneratedBindingList(
  scopes: Scope,
  generatedAstScopes: SourceScope[],
  thisBinding: ?BindingContents
): Array<GeneratedBindingLocation> {
  // The server's binding data doesn't include general 'this' binding
  // information, so we manually inject the one 'this' binding we have into
  // the normal binding data we are working with.
  const frameThisOwner = generatedAstScopes.find(
    generated => "this" in generated.bindings
  );

  const clientScopes = [];
  for (let s = scopes; s; s = s.parent) {
    const bindings = s.bindings
      ? Object.assign({}, ...s.bindings.arguments, s.bindings.variables)
      : {};

    clientScopes.push(bindings);
  }

  const generatedMainScopes = generatedAstScopes.slice(0, -2);
  const generatedGlobalScopes = generatedAstScopes.slice(-2);

  const clientMainScopes = clientScopes.slice(0, generatedMainScopes.length);
  const clientGlobalScopes = clientScopes.slice(generatedMainScopes.length);

  // Map the main parsed script body using the nesting hierarchy of the
  // generated and client scopes.
  const generatedBindings = generatedMainScopes.reduce((acc, generated, i) => {
    const bindings = clientMainScopes[i];

    if (generated === frameThisOwner && thisBinding) {
      bindings.this = {
        value: thisBinding
      };
    }

    for (const name of Object.keys(generated.bindings)) {
      const { refs } = generated.bindings[name];
      for (const loc of refs) {
        acc.push({
          name,
          loc,
          desc: bindings[name] || null
        });
      }
    }
    return acc;
  }, []);

  // Bindings in the global/lexical global of the generated code may or
  // may not be the real global if the generated code is running inside
  // of an evaled context. To handle this, we just look up the client scope
  // hierarchy to find the closest binding with that name.
  for (const generated of generatedGlobalScopes) {
    for (const name of Object.keys(generated.bindings)) {
      const { refs } = generated.bindings[name];
      for (const loc of refs) {
        const bindings = clientGlobalScopes.find(b => has(b, name));

        if (bindings) {
          generatedBindings.push({
            name,
            loc,
            desc: bindings[name]
          });
        }
      }
    }
  }

  // Sort so we can binary-search.
  return generatedBindings.sort((a, b) => {
    const aStart = a.loc.start;
    const bStart = a.loc.start;

    if (aStart.line === bStart.line) {
      return locColumn(aStart) - locColumn(bStart);
    }
    return aStart.line - bStart.line;
  });
}
