/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Tests that a basic XHR breakpoint works for get and POST is ignored
add_task(async function() {
  const dbg = await initDebugger("doc-xhr.html");
  await waitForSources(dbg, "fetch.js");
  await dbg.actions.setXHRBreakpoint("doc", "GET");
  invokeInTab("main", "doc-xhr.html");
  await waitForPaused(dbg);
  assertPausedLocation(dbg);
  resume(dbg);

  await dbg.actions.removeXHRBreakpoint(0);
  invokeInTab("main", "doc-xhr.html");
  assertNotPaused(dbg);

  await dbg.actions.setXHRBreakpoint("doc-xhr.html", "POST");
  invokeInTab("main", "doc");
  assertNotPaused(dbg);
});

// Tests the "pause on any URL" checkbox works properly
add_task(async function() {
  const dbg = await initDebugger("doc-xhr.html");
  await waitForSources(dbg, "fetch.js");

  // Enable pause on any URL
  await dbg.actions.togglePauseOnAny();
  invokeInTab("main", "doc-xhr.html");
  await waitForPaused(dbg);
  await resume(dbg);

  invokeInTab("main", "fetch.js");
  await waitForPaused(dbg);
  await resume(dbg);

  invokeInTab("main", "README.md");
  await waitForPaused(dbg);
  await resume(dbg);

  // Disable pause on any URL
  await dbg.actions.togglePauseOnAny();
  invokeInTab("main", "README.md");
  assertNotPaused(dbg);

  // Turn off the checkbox
  await dbg.actions.togglePauseOnAny();
});

// Tests removal works properly
add_task(async function() {
  const dbg = await initDebugger("doc-xhr.html");

  await Promise.all([
    dbg.actions.togglePauseOnAny(),
    dbg.actions.setXHRBreakpoint("1", "GET"),
    dbg.actions.setXHRBreakpoint("2", "GET"),
    dbg.actions.setXHRBreakpoint("3", "GET"),
    dbg.actions.setXHRBreakpoint("4", "GET"),
  ]);

  // Remove "2"
  await dbg.actions.removeXHRBreakpoint(2);

  // Ensure that the checkbox not affected by removal of text-based breakpoints
  const xhrBreakpoints = dbg.selectors.getXHRBreakpoints(dbg.store.getState());
  is(xhrBreakpoints.size, 4, "4 XHR breakpoints remain");
  is(
    xhrBreakpoints.filter(bp => bp.path ==="").size, 1, 
    "The pause on any is still checked"
  );
  is(
    xhrBreakpoints.map(bp => bp.path).join(""),
    "134",
    "Only the desired breakpoint was removed"
  );
});