/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

add_task(async function() {
  await pushPref("devtools.features.skip-pausing", true);

  let dbg = await initDebugger("doc-scripts.html");

  await selectSource(dbg, "simple3");
  await addBreakpoint(dbg, "simple3", 2);
  await addBreakpoint(dbg, "simple3", 3);

  let syncedBps = waitForDispatch(dbg, "SYNC_BREAKPOINT", 2);
  await reload(dbg, "simple3");
  await waitForSelectedSource(dbg, "simple3");
  await syncedBps;

  assertNotPaused(dbg);

  // Turn "skip pausing" on
  clickElementWithSelector(dbg, ".command-bar-skip-pausing");

  syncedBps = waitForDispatch(dbg, "SYNC_BREAKPOINT", 2);
  await reload(dbg, "simple3");
  await waitForSelectedSource(dbg, "simple3");
  await syncedBps;

  assertPaused(dbg);
});
