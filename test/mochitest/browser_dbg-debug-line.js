/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Test ensures zombie debug lines do not persist
// https://github.com/firefox-devtools/debugger/issues/7755
add_task(async function() {
  // Load test files
  const dbg = await initDebugger("doc-debug-line.html");
  await waitForSources(dbg, "debug-line-1.js", "debug-line-2.js");

  // Add breakpoint to debug-line-2
  await addBreakpoint(dbg, "debug-line-2.js", 5);

  // Trigger the breakpoint ane ensure we're paused
  invokeInTab("doThing");
  await waitForPaused(dbg);

  // Click the call stack to get to debugger-line-1
  await clickElement(dbg, "frame", 2);
  await waitForSelectedSource(dbg, "debug-line-1.js");

  // Resume, which ends all pausing and would trigger the problem
  resume(dbg);

  // Select the source that had the initial debug line
  await selectSource(dbg, "debug-line-2.js");

  info("Ensuring there's no zombie debug line");
  is(
    findAllElements(dbg, "debugLine").length,
    0,
    "Debug line no longer exists!"
  );
});
