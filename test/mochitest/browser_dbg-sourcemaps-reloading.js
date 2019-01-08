/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */
requestLongerTimeout(2);

async function waitForBreakpointCount(dbg, count) {
  return waitForState(
    dbg,
    state => dbg.selectors.getBreakpointCount(state) === count
  );
}

add_task(async function() {
  // NOTE: the CORS call makes the test run times inconsistent
  const dbg = await initDebugger("doc-sourcemaps.html");
  const {
    selectors: { getBreakpoint, getBreakpointCount },
    getState
  } = dbg;

  await waitForSources(dbg, "entry.js", "output.js", "times2.js", "opts.js");
  ok(true, "Original sources exist");
  const entrySrc = findSource(dbg, "entry.js");

  await selectSource(dbg, entrySrc);
  ok(
    getCM(dbg)
      .getValue()
      .includes("window.keepMeAlive"),
    "Original source text loaded correctly"
  );

  // Test that breakpoint sliding is not attempted. The breakpoint
  // should not move anywhere.
  await addBreakpoint(dbg, entrySrc, 13);
  is(getBreakpointCount(getState()), 1, "One breakpoint exists");

  ok(
    getBreakpoint(getState(), { sourceId: entrySrc.id, line: 13 }),
    "Breakpoint has correct line"
  );

  await addBreakpoint(dbg, entrySrc, 5);

  await addBreakpoint(dbg, entrySrc, 15);
  await disableBreakpoint(dbg, entrySrc, 15);

  // Test reloading the debugger
  await reload(dbg, "opts.js");
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");

  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  await waitForBreakpointCount(dbg, 3);
  is(getBreakpointCount(getState()), 3, "Three breakpoints exist");

  ok(
    getBreakpoint(getState(), { sourceId: entrySrc.id, line: 13 }),
    "Breakpoint has correct line"
  );

  ok(
    getBreakpoint(getState(), {
      sourceId: entrySrc.id,
      line: 15,
      disabled: true
    }),
    "Breakpoint has correct line"
  );
});
