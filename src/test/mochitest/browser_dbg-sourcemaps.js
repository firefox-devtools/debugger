/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests loading sourcemapped sources, setting breakpoints, and
// stepping in them.

function assertBreakpointExists(dbg, source, line) {
  const { selectors: { getBreakpoint }, getState } = dbg;

  ok(
    getBreakpoint(getState(), { sourceId: source.id, line }),
    "Breakpoint has correct line"
  );
}

function assertEditorBreakpoint(dbg, line, shouldExist) {
  const exists = !!getLineEl(dbg, line).querySelector(".new-breakpoint");
  ok(
    exists === shouldExist,
    "Breakpoint " +
      (shouldExist ? "exists" : "does not exist") +
      " on line " +
      line
  );
}

function getLineEl(dbg, line) {
  const lines = dbg.win.document.querySelectorAll(".CodeMirror-code > div");
  return lines[line - 1];
}

function clickGutter(dbg, line) {
  clickElement(dbg, "gutter", line);
}

add_task(async function() {
  // NOTE: the CORS call makes the test run times inconsistent
  requestLongerTimeout(2);

  const dbg = await initDebugger("doc-sourcemaps.html");
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  await waitForSources(dbg, "entry.js", "output.js", "times2.js", "opts.js");
  ok(true, "Original sources exist");
  const bundleSrc = findSource(dbg, "bundle.js");

  await selectSource(dbg, bundleSrc);

  await clickGutter(dbg, 13);
  await waitForDispatch(dbg, "ADD_BREAKPOINT");
  assertEditorBreakpoint(dbg, 13, true);

  await clickGutter(dbg, 13);
  await waitForDispatch(dbg, "REMOVE_BREAKPOINT");
  is(getBreakpoints(getState()).size, 0, "No breakpoints exists");

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
  assertBreakpointExists(dbg, entrySrc, 13);

  // Test breaking on a breakpoint
  await addBreakpoint(dbg, "entry.js", 15);
  is(getBreakpoints(getState()).size, 2, "Two breakpoints exist");
  assertBreakpointExists(dbg, entrySrc, 15);

  invokeInTab("keepMeAlive");
  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  await stepIn(dbg);
  assertPausedLocation(dbg);
  await stepOver(dbg);
  assertPausedLocation(dbg);

  await stepOut(dbg);
  await stepOut(dbg);
  assertPausedLocation(dbg);
});
