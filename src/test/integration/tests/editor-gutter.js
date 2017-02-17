const {
  initDebugger,
  clickElement,
  assertPausedLocation,
  findSource,
  selectSource,
  addBreakpoint,
  assertHighlightLocation,
  waitForPaused,
  waitForDispatch
} = require("../utils")

// Tests the breakpoint gutter and making sure breakpoint icons exist
// correctly

// Utilities for interacting with the editor
function clickGutter(dbg, line) {
  clickElement(dbg, "gutter", line);
}

function getLineEl(dbg, line) {
  const lines = dbg.win.document.querySelectorAll(".CodeMirror-code > div");
  return lines[line - 1];
}

function assertEditorBreakpoint(dbg, ctx, line, shouldExist) {
  const { ok } = ctx;
  const exists = !!getLineEl(dbg, line).querySelector(".new-breakpoint");
  ok(exists === shouldExist,
     "Breakpoint " + (shouldExist ? "exists" : "does not exist") +
     " on line " + line);
}

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getBreakpoints, getBreakpoint }, getState } = dbg;
  const source = findSource(dbg, "simple1.js");

  await selectSource(dbg, source.url);

  // Make sure that clicking the gutter creates a breakpoint icon.
  clickGutter(dbg, 4);
  await waitForDispatch(dbg, "ADD_BREAKPOINT");
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  assertEditorBreakpoint(dbg, ctx, 4, true);

  // Make sure clicking at the same place removes the icon.
  clickGutter(dbg, 4);
  await waitForDispatch(dbg, "REMOVE_BREAKPOINT");
  is(getBreakpoints(getState()).size, 0, "No breakpoints exist");
  assertEditorBreakpoint(dbg, ctx, 4, false);

  // Test that a breakpoint icon slides down to the correct line.
  clickGutter(dbg, 2);
  await waitForDispatch(dbg, "ADD_BREAKPOINT");
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  ok(getBreakpoint(getState(), { sourceId: source.id, line: 4 }),
     "Breakpoint has correct line");
  assertEditorBreakpoint(dbg, ctx, 2, false);
  assertEditorBreakpoint(dbg, ctx, 4, true);

  // Do the same sliding and make sure it works if there's already a
  // breakpoint.
  clickGutter(dbg, 2);
  await waitForDispatch(dbg, "ADD_BREAKPOINT");
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  assertEditorBreakpoint(dbg, ctx, 2, false);
  assertEditorBreakpoint(dbg, ctx, 4, true);

  clickGutter(dbg, 4);
  await waitForDispatch(dbg, "REMOVE_BREAKPOINT");
  is(getBreakpoints(getState()).size, 0, "No breakpoints exist");
  assertEditorBreakpoint(dbg, ctx, 4, false);
}
