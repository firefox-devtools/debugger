export function generateClientScope(
  scopes: Scope,
  originalScopes: Array<SourceScope & { generatedBindings: ScopeBindings }>
): OriginalScope {
  // Pull the root object scope and root lexical scope to reuse them in
  // our mapped scopes. This assumes that file file being processed is
  // a CommonJS or ES6 module, which might not be ideal. Potentially
  // should add some logic to try to detect those cases?
  let globalLexicalScope: ?OriginalScope = null;
  for (let s = scopes; s.parent; s = s.parent) {
    // $FlowIgnore - Flow doesn't like casting 'parent'.
    globalLexicalScope = s;
  }
  if (!globalLexicalScope) {
    throw new Error("Assertion failure - there should always be a scope");
  }

  // Build a structure similar to the client's linked scope object using
  // the original AST scopes, but pulling in the generated bindings
  // linked to each scope.
  const result = originalScopes
    .slice(0, -2)
    .reverse()
    .reduce((acc, orig, i): OriginalScope => {
      const {
        // The 'this' binding data we have is handled independently, so
        // the binding data is not included here.
        // eslint-disable-next-line no-unused-vars
        this: _this,
        ...variables
      } = orig.generatedBindings;

      return {
        // Flow doesn't like casting 'parent'.
        parent: (acc: any),
        actor: `originalActor${i}`,
        type: orig.type,
        bindings: {
          arguments: [],
          variables
        },
        ...(orig.type === "function"
          ? {
              function: {
                displayName: orig.displayName
              }
            }
          : null),
        ...(orig.type === "block"
          ? {
              block: {
                displayName: orig.displayName
              }
            }
          : null)
      };
    }, globalLexicalScope);

  // The rendering logic in getScope 'this' bindings only runs on the current
  // selected frame scope, so we pluck out the 'this' binding that was mapped,
  // and put it in a special location
  const thisScope = originalScopes.find(scope => scope.bindings.this);
  if (thisScope) {
    result.bindings.this = thisScope.generatedBindings.this || null;
  }

  return result;
}
