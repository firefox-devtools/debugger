/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function countSources(dbg) {
  const sources = dbg.selectors.getSources(dbg.getState());
  return sources.size;
}

/**
 * Test navigating
 * navigating while paused will reset the pause state and sources
 */
add_task(async function() {
  const dbg = await initDebugger("doc-script-switching.html");
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;

  invokeInTab("firstCall");
  await waitForPaused(dbg);

  await navigate(dbg, "doc-scripts.html", "simple1.js");
  await addBreakpoint(dbg, "simple1.js", 4);
  invokeInTab("main");
  await waitForPaused(dbg);
  assertPausedLocation(dbg);
  is(countSources(dbg), 4, "4 sources are loaded.");

  await navigate(dbg, "about:blank");
  await waitForDispatch(dbg, "NAVIGATE");
  is(countSources(dbg), 0, "0 sources are loaded.");
  ok(!getPause(getState()), "No pause state exists");

  await navigate(
    dbg,
    "doc-scripts.html",
    "simple1.js",
    "simple2.js",
    "long.js",
    "scripts.html"
  );

  is(countSources(dbg), 4, "4 sources are loaded.");

  // Test that the current select source persists across reloads
  await selectSource(dbg, "long.js");
  await reload(dbg, "long.js");
  ok(
    getSelectedSource(getState())
      .get("url")
      .includes("long.js"),
    "Selected source is long.js"
  );
});
