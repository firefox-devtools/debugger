/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Test ensures zombie debug lines do not persist
// https://github.com/firefox-devtools/debugger/issues/7755
add_task(async function() {
  const dbg = await initDebugger("doc-debug-line.html");

  // Ensure test files load
  await waitForSources(dbg, "debug-line-1.js", "debug-line-2.js");

  // Add breakpoint to debug-line-2
  await addBreakpoint(dbg, "debug-line-2.js", 5);

  // Reload
  invokeInTab("doThing");

  // Ensure we're paused
  await waitForPaused(dbg);

  // Click the call stack to get to debugger-line-1
  const otherLocation = findAllElementsWithSelector(dbg, ".frame")[1];
  otherLocation.click();
  await waitForSelectedSource(dbg, "debug-line-1.js");

  // Resume
  resume(dbg);

  // Select the source that had the initial debug line
  await selectSource(dbg, "debug-line-2.js");

  // Ensure there's no longer a debug line
  is(
    findAllElementsWithSelector(dbg, ".new-debug-line").length,
    0,
    "Debug line no longer exists!"
  );
});
