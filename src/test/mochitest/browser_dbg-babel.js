/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

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
    `.tree-node[aria-level="0"][data-expandable="true"]:not([aria-expanded="true"])`
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
      is(getScopeValue(dbg, i + 1), val[1]);
    } else {
      is(getScopeLabel(dbg, i + 1), val);
    }
  }

  is(getScopeLabel(dbg, items.length + 1), "Window");
}

add_task(async function() {
  await pushPref("devtools.debugger.features.map-scopes", true);

  const dbg = await initDebugger("doc-babel.html");

  await breakpointScopes(dbg, "for-of", { line: 5, column: 4 }, [
    "For",
    ["x", "1"],
    "forOf",
    "doThing()",
    "Module",
    "forOf",
    "mod"
  ]);
});
