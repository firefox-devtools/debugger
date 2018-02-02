/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests loading sourcemapped sources, setting breakpoints, and
// inspecting restored scopes.

function toggleNode(dbg, index) {
  clickElement(dbg, "scopeNode", index);
}

function getLabel(dbg, index) {
  return findElement(dbg, "scopeNode", index).innerText;
}

function hasScopeNode(dbg, index) {
  return !!findElement(dbg, "scopeNode", index);
}

async function waitForScopeNode(dbg, index) {
  const selector = getSelector("scopeNode", index);
  return waitForElementWithSelector(dbg, selector);
}

// This source map does not have source contents, so it's fetched separately
add_task(async function() {
  // NOTE: the CORS call makes the test run times inconsistent
  requestLongerTimeout(2);
  await pushPref("devtools.debugger.features.map-scopes", true);

  const dbg = await initDebugger("doc-sourcemaps3.html");
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  await waitForSources(dbg, "bundle.js", "sorted.js", "test.js");

  ok(true, "Original sources exist");
  const sortedSrc = findSource(dbg, "sorted.js");

  await selectSource(dbg, sortedSrc);

  // Test that breakpoint is not off by a line.
  await addBreakpoint(dbg, sortedSrc, 9);
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  ok(
    getBreakpoint(getState(), { sourceId: sortedSrc.id, line: 9, column: 4 }),
    "Breakpoint has correct line"
  );

  invokeInTab("test");

  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  is(getLabel(dbg, 1), "Block");
  is(getLabel(dbg, 2), "na");
  is(getLabel(dbg, 3), "nb");

  is(getLabel(dbg, 4), "Block");
  is(
    hasScopeNode(dbg, 7) && !hasScopeNode(dbg, 8),
    true,
    "scope count before expand 1"
  );
  toggleNode(dbg, 4);

  await waitForScopeNode(dbg, 9);

  is(getLabel(dbg, 5), "ma");
  is(getLabel(dbg, 6), "mb");

  is(
    hasScopeNode(dbg, 9) && !hasScopeNode(dbg, 10),
    true,
    "scope count before expand 2"
  );
  toggleNode(dbg, 7);

  await waitForScopeNode(dbg, 11);

  is(getLabel(dbg, 8), "a");
  is(getLabel(dbg, 9), "b");

  is(getLabel(dbg, 10), "Module");

  is(
    hasScopeNode(dbg, 11) && !hasScopeNode(dbg, 12),
    true,
    "scope count before expand 3"
  );
  toggleNode(dbg, 10);

  await waitForScopeNode(dbg, 12);

  is(getLabel(dbg, 11), "binaryLookup:o()");
  is(getLabel(dbg, 12), "comparer:t()");
  is(getLabel(dbg, 13), "fancySort");
});
