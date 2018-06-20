/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

add_task(async function() {
  await pushPref("devtools.debugger.skip-pausing", true);
  await pushPref("devtools.debugger.features.skip-pausing", true);

  let dbg = await initDebugger("doc-scripts.html");

  await selectSource(dbg, "simple3");
  await addBreakpoint(dbg, "simple3", 2);
  await addBreakpoint(dbg, "simple3", 3);
  await waitForDispatch(dbg, "SYNC_BREAKPOINT", 2);

  // Click the button to trigger breakpoints
  //findElementWithSelector(dbg, "button").click();
  invokeInTab("simple");

  assertPaused(dbg);

  // Turn "skip pausing" on
  clickElementWithSelector(dbg, ".command-bar-skip-pausing");

  // Click the button to trigger breakpoints
  //findElementWithSelector(dbg, "button").click();
  invokeInTab("simple");

  assertNotPaused(dbg);
});
