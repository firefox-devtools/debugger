/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function openFirstBreakpointContextMenu(dbg){
  rightClickElement(dbg, "breakpointItem", 3);
}


// Tests to see if we can trigger a breakpoint action via the context menu
add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html", "simple2");
  await selectSource(dbg, "simple2");
  await waitForSelectedSource(dbg, "simple2");

  await addBreakpoint(dbg, "simple2", 3);

  openFirstBreakpointContextMenu(dbg)
  // select "Remove breakpoint"
  selectContextMenuItem(dbg, selectors.breakpointContextMenu.remove);

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

  openFirstBreakpointContextMenu(dbg);
  // select "Disable Others"
  let dispatched = waitForDispatch(dbg, "DISABLE_BREAKPOINT", 3);
  selectContextMenuItem(dbg, selectors.breakpointContextMenu.disableOthers);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state)
      .every(bp => (bp.location.line !== 1) === bp.disabled)
  );
  await dispatched;
  ok("breakpoint at 1 is the only enabled breakpoint");

  openFirstBreakpointContextMenu(dbg);
  // select "Disable All"
  dispatched = waitForDispatch(dbg, "DISABLE_ALL_BREAKPOINTS");
  selectContextMenuItem(dbg, selectors.breakpointContextMenu.disableAll);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state).every(bp => bp.disabled)
  );
  await dispatched;
  ok("all breakpoints are disabled");

  openFirstBreakpointContextMenu(dbg);
  // select "Enable Others"
  dispatched = waitForDispatch(dbg, "ENABLE_BREAKPOINT", 3);
  selectContextMenuItem(dbg, selectors.breakpointContextMenu.enableOthers);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state)
      .every(bp => (bp.location.line === 1) === bp.disabled)
  );
  await dispatched;
  ok("all breakpoints except line 1 are enabled");

  openFirstBreakpointContextMenu(dbg);
  // select "Remove Others"
  dispatched = waitForDispatch(dbg, "REMOVE_BREAKPOINT", 3);
  selectContextMenuItem(dbg, selectors.breakpointContextMenu.removeOthers);
  await waitForState(dbg, state =>
    dbg.selectors.getBreakpointsList(state).length === 1 &&
    dbg.selectors.getBreakpointsList(state)[0].location.line === 1
  );
  await dispatched;
  ok("remaining breakpoint should be on line 1");
});
