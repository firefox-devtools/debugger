const {
  initDebugger,
  reload,
  selectSource,
  findElement,
  waitForDispatch,
  closeTab,
  assertPausedLocation,
  findSource,
  waitForSources,
  disableBreakpoint,
  addBreakpoint,
  waitForPaused
} = require("../utils");

function assertBP(dbg, sourceId, { line, disabled = false }) {
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;
  const bp = getBreakpoint(getState(), { sourceId, line });

  is(bp.location.line, line, "Breakpoint has correct line");

  is(bp.disabled, disabled);
}

module.exports = async function sourceMapsReloading(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  const dbg = await initDebugger("doc-sourcemaps.html");
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  await waitForSources(dbg, "entry.js", "output.js", "times2.js", "opts.js");
  const entrySrc = findSource(dbg, "entry.js");
  await selectSource(dbg, entrySrc);

  await addBreakpoint(dbg, entrySrc, 13);
  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  assertBP(dbg, entrySrc.id, { line: 13 });

  await addBreakpoint(dbg, entrySrc, 15);
  await disableBreakpoint(dbg, entrySrc, 15);

  // Test reloading the debugger
  await reload(dbg, "times2.js", "opts.js");
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");

  is(getBreakpoints(getState()).size, 2, "One breakpoint exists");
  assertBP(dbg, entrySrc.id, { line: 13 });
  assertBP(dbg, entrySrc.id, { line: 15, disabled: true });
};
