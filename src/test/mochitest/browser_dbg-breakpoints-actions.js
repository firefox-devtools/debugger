/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function openFirstBreakpointContextMenu(dbg){
  rightClickElement(dbg, "breakpointItem", 3);
}


// Tests to see if we can trigger a breakpoint action via the context menu
add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  await selectSource(dbg, "simple2");
  await waitForSelectedSource(dbg, "simple2");

  await addBreakpoint(dbg, "simple2", 3);

  openFirstBreakpointContextMenu(dbg)
  // select "Remove breakpoint"
  selectMenuItem(dbg, 1);

  await waitForState(dbg, state => dbg.selectors.getBreakpointCount(state) === 0);
  ok("successfully removed the breakpoint");
});

// Tests "disable others", "enable others" and "remove others" context actions
add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  await selectSource(dbg, "simple1");
  await waitForSelectedSource(dbg, "simple1");

  await addBreakpoint(dbg, "simple1", 1);
  await addBreakpoint(dbg, "simple1", 4);
  await addBreakpoint(dbg, "simple1", 5);
  await addBreakpoint(dbg, "simple1", 6);

  openFirstBreakpointContextMenu(dbg)
  // select "Disable Others"
  selectMenuItem(dbg, 7);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state)
      .every(bp => (bp.location.line !== 1) === bp.disabled)
  );
  ok("breakpoint at 1 is the only enabled breakpoint");

  openFirstBreakpointContextMenu(dbg)
  // select "Disable All"
  selectMenuItem(dbg, 9);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state).every(bp => bp.disabled)
  );
  ok("all breakpoints are disabled")

  openFirstBreakpointContextMenu(dbg)
  // select "Enable Others"
  selectMenuItem(dbg, 3);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state)
      .every(bp => (bp.location.line === 1) === bp.disabled)
  );
  ok("all breakpoints except line 1 are enabled");

  openFirstBreakpointContextMenu(dbg)
  // select "Remove Others"
  selectMenuItem(dbg, 6);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state).length === 1 &&
    dbg.selectors.getBreakpointsList(state)[0].location.line === 1
  );
  ok("remaining breakpoint should be on line 1");
});
