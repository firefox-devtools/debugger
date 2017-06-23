const {
  initDebugger,
  assertPausedLocation,
  findSource,
  waitForSources,
  selectSource,
  addBreakpoint,
  stepIn,
  stepOut,
  stepOver,
  invokeInTab,
  waitForPaused
} = require("../utils");

// Tests loading sourcemapped sources, setting breakpoints, and
// stepping in them.

module.exports = async function sourceMaps(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-sourcemaps.html");
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  await waitForSources(dbg, "entry.js", "output.js", "times2.js", "opts.js");
  ok(true, "Original sources exist");
  const entrySrc = findSource(dbg, "entry.js");

  await selectSource(dbg, entrySrc);
  ok(
    dbg.win.cm.getValue().includes("window.keepMeAlive"),
    "Original source text loaded correctly"
  );

  // Test that breakpoint sliding is not attempted. The breakpoint
  // should not move anywhere.
  await addBreakpoint(dbg, entrySrc, 13);
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  ok(
    getBreakpoint(getState(), { sourceId: entrySrc.id, line: 13 }),
    "Breakpoint has correct line"
  );

  // Test breaking on a breakpoint
  await addBreakpoint(dbg, "entry.js", 15);
  is(getBreakpoints(getState()).size, 2, "Two breakpoints exist");
  ok(
    getBreakpoint(getState(), { sourceId: entrySrc.id, line: 15 }),
    "Breakpoint has correct line"
  );

  invokeInTab(dbg, "keepMeAlive");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, entrySrc, 15);

  await stepIn(dbg);
  assertPausedLocation(dbg, ctx, "times2.js", 2);
  await stepOver(dbg);
  assertPausedLocation(dbg, ctx, "times2.js", 3);

  await stepOut(dbg);
  await stepOut(dbg);
  assertPausedLocation(dbg, ctx, "entry.js", 16);
};
