/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// This test can be really slow on debug platforms and should be split.
requestLongerTimeout(4);

// Tests loading sourcemapped sources for Babel's compile output.

async function breakpointScopes(dbg, fixture, { line, column }, scopes) {
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  const filename = `fixtures/${fixture}/input.js`;
  await waitForSources(dbg, filename);

  ok(true, "Original sources exist");
  const source = findSource(dbg, filename);

  await selectSource(dbg, source);

  // Test that breakpoint is not off by a line.
  await addBreakpoint(dbg, source, line);

  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  ok(
    getBreakpoint(getState(), { sourceId: source.id, line, column }),
    "Breakpoint has correct line"
  );

  const fnName = fixture.replace(/-([a-z])/g, (s, c) => c.toUpperCase());

  const invokeResult = invokeInTab(fnName);

  let invokeFailed = await Promise.race([
    waitForPaused(dbg),
    invokeResult.then(() => new Promise(() => {}), () => true)
  ]);

  if (invokeFailed) {
    return invokeResult;
  }

  assertPausedLocation(dbg);

  await assertScopes(dbg, scopes);

  await removeBreakpoint(dbg, source.id, line, column);

  is(getBreakpoints(getState()).size, 0, "Breakpoint reverted");

  await resume(dbg);

  // If the invoke errored later somehow, capture here so the error is reported nicely.
  await invokeResult;

  ok(true, `Ran tests for ${fixture} at line ${line} column ${column}`);
}

async function expandAllScopes(dbg) {
  const scopes = await waitForElement(dbg, "scopes");
  const scopeElements = scopes.querySelectorAll(
    `.tree-node[aria-level="1"][data-expandable="true"]:not([aria-expanded="true"])`
  );
  const indices = Array.from(scopeElements, el => {
    return Array.prototype.indexOf.call(el.parentNode.childNodes, el);
  }).reverse();

  for (const index of indices) {
    await toggleScopeNode(dbg, index + 1);
  }
}

async function assertScopes(dbg, items) {
  await expandAllScopes(dbg);

  for (const [i, val] of items.entries()) {
    if (Array.isArray(val)) {
      is(getScopeLabel(dbg, i + 1), val[0]);
      is(
        getScopeValue(dbg, i + 1),
        val[1],
        `"${val[0]}" has the expected "${val[1]}" value`
      );
    } else {
      is(getScopeLabel(dbg, i + 1), val);
    }
  }

  is(getScopeLabel(dbg, items.length + 1), "Window");
}

add_task(async function() {
  await pushPref("devtools.debugger.features.map-scopes", true);

  const dbg = await initDebugger("doc-babel.html");

  await breakpointScopes(dbg, "eval-source-maps", { line: 14, column: 4 }, [
    "Block",
    ["three", "5"],
    ["two", "4"],
    "Block",
    ["three", "3"],
    ["two", "2"],
    "root",
    ["one", "1"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "for-of", { line: 5, column: 4 }, [
    "For",
    ["x", "1"],
    "forOf",
    "doThing()",
    "Module",
    "forOf",
    "mod"
  ]);

  await breakpointScopes(dbg, "shadowed-vars", { line: 18, column: 6 }, [
    "Block",
    ["aConst", '"const3"'],
    ["aLet", '"let3"'],
    "Block",
    ["aConst", '"const2"'],
    ["aLet", '"let2"'],
    "Outer:_Outer()",
    "Block",
    ["aConst", '"const1"'],
    ["aLet", '"let1"'],
    "Outer()",
    "default",
    ["aVar", '"var3"']
  ]);

  await breakpointScopes(
    dbg,
    "this-arguments-bindings",
    { line: 4, column: 4 },
    [
      "Block",
      ["<this>", '"this-value"'],
      ["arrow", "undefined"],
      "fn",
      ["arg", '"arg-value"'],
      ["arguments", "Arguments"],
      "root",
      "fn()",
      "Module",
      "root()"
    ]
  );

  // No '<this>' binding here because Babel does not currently general
  // the current mappings for 'this' bindings.
  await breakpointScopes(
    dbg,
    "this-arguments-bindings",
    { line: 8, column: 6 },
    [
      "arrow",
      ["argArrow", "(unmapped)"],
      "Block",
      "arrow()",
      "fn",
      ["arg", '"arg-value"'],
      ["arguments", "Arguments"],
      "root",
      "fn()",
      "Module",
      "root()"
    ]
  );

  // Babel 6's imports aren't fully mapped, so they show as unavailable.
  // The call-based ones work, but the single-identifier ones do not.
  await breakpointScopes(dbg, "imported-bindings", { line: 20, column: 2 }, [
    "Module",
    ["aDefault", '"a-default"'],
    ["aDefault2", '"a-default2"'],
    ["aDefault3", '"a-default3"'],
    ["anAliased", '"an-original"'],
    ["anAliased2", '"an-original2"'],
    ["anAliased3", '"an-original3"'],
    ["aNamed", '"a-named"'],
    ["aNamed2", '"a-named2"'],
    ["aNamed3", '"a-named3"'],
    ["aNamespace", "{\u2026}"],
    ["aNamespace2", "{\u2026}"],
    ["aNamespace3", "{\u2026}"],
    ["optimizedOut", "(optimized away)"],
    "root()"
  ]);

  await breakpointScopes(dbg, "classes", { line: 12, column: 6 }, [
    "Block",
    ["three", "3"],
    ["two", "2"],
    "Class",
    "Another()",
    "Block",
    "Another()",
    ["one", "1"],
    "Thing()",
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "for-loops", { line: 5, column: 4 }, [
    "For",
    ["i", "1"],
    "Block",
    ["i", "0"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "for-loops", { line: 9, column: 4 }, [
    "For",
    ["i", '"2"'],
    "Block",
    ["i", "0"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "for-loops", { line: 13, column: 4 }, [
    "For",
    ["i", "3"],
    "Block",
    ["i", "0"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "functions", { line: 6, column: 8 }, [
    "arrow",
    ["p3", "undefined"],
    "Block",
    "arrow()",
    "inner",
    ["p2", "undefined"],
    "Function Expression",
    "inner()",
    "Block",
    "inner()",
    "decl",
    ["p1", "undefined"],
    "root",
    "decl()",
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "modules", { line: 7, column: 2 }, [
    "Module",
    ["alsoModuleScoped", "2"],
    ["moduleScoped", "1"],
    "thirdModuleScoped()"
  ]);

  await breakpointScopes(dbg, "commonjs", { line: 7, column: 2 }, [
    "Module",
    ["alsoModuleScoped", "2"],
    ["moduleScoped", "1"],
    "thirdModuleScoped()"
  ]);

  await breakpointScopes(dbg, "out-of-order-declarations", { line: 8, column: 4 }, [
    "callback",
    "fn()",
    ["val", "undefined"],
    "root",
    ["callback", "(optimized away)"],
    ["fn", "(optimized away)"],
    ["val", "(optimized away)"],
    "Module",

    // This value is currently unmapped because import declarations don't map
    // very well and ones at the end of the file map especially badly.
    ["aDefault", "(unmapped)"],
    ["root", "(optimized away)"],
    ["val", "(optimized away)"],
  ]);

  await breakpointScopes(dbg, "non-modules", { line: 7, column: 2 }, []);

  await breakpointScopes(dbg, "flowtype-bindings", { line: 8, column: 2 }, [
    "Module",
    ["aConst", '"a-const"'],
    "root()"
  ]);

  await breakpointScopes(dbg, "switches", { line: 7, column: 6 }, [
    "Switch",
    ["val", "2"],
    "Block",
    ["val", "1"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "switches", { line: 10, column: 6 }, [
    "Block",
    ["val", "3"],
    "Switch",
    ["val", "2"],
    "Block",
    ["val", "1"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "try-catches", { line: 8, column: 4 }, [
    "Block",
    ["two", "2"],
    "Catch",
    ["err", '"AnError"'],
    "Block",
    ["one", "1"],
    "Module",
    "root()"
  ]);

  await breakpointScopes(dbg, "webpack-modules", { line: 20, column: 2 }, [
    "Module",
    ["aDefault", '"a-default"'],
    ["aDefault2", '"a-default2"'],
    ["aDefault3", '"a-default3"'],
    ["anAliased", "Getter"],
    ["anAliased2", "Getter"],
    ["anAliased3", "Getter"],
    ["aNamed", "Getter"],
    ["aNamed2", "Getter"],
    ["aNamed3", "Getter"],
    ["aNamespace", "{\u2026}"],
    ["aNamespace2", "{\u2026}"],
    ["aNamespace3", "{\u2026}"],
    ["optimizedOut", "(optimized away)"],
    "root()"
  ]);

  await breakpointScopes(dbg, "webpack-modules-es6", { line: 20, column: 2 }, [
    "Module",
    ["aDefault", '"a-default"'],
    ["aDefault2", '"a-default2"'],
    ["aDefault3", '"a-default3"'],
    ["anAliased", '"an-original"'],
    ["anAliased2", '"an-original2"'],
    ["anAliased3", '"an-original3"'],
    ["aNamed", '"a-named"'],
    ["aNamed2", '"a-named2"'],
    ["aNamed3", '"a-named3"'],
    ["aNamespace", "{\u2026}"],
    ["aNamespace2", "{\u2026}"],
    ["aNamespace3", "{\u2026}"],
    ["optimizedOut", "(optimized away)"],
    "root()"
  ]);

  await breakpointScopes(dbg, "webpack-standalone", { line: 11, column: 0 }, [
    "Block",
    ["<this>", '"this-value"'],
    ["arg", '"arg-value"'],
    ["arguments", "Arguments"],
    ["inner", "undefined"],
    "Block",
    ["someName", "(optimized away)"],
    "Block",
    ["two", "2"],
    "Block",
    ["one", "1"],
    "root",
    ["arguments", "Arguments"],
    "fn:someName()",
    "webpackStandalone",
    ["__webpack_exports__", "(optimized away)"],
    ["__WEBPACK_IMPORTED_MODULE_0__src_mod1__", "{\u2026}"],
    ["__webpack_require__", "(optimized away)"],
    ["arguments", "(unavailable)"],
    ["module", "(optimized away)"],
    "root()"
  ]);
});
