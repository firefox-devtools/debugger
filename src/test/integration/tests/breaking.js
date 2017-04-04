const {
  assertPausedLocation,
  findSource,
  findElement,
  selectSource,
  clickElement,
  addBreakpoint,
  reload,
  stepOver,
  invokeInTab,
  resume,
  waitForPaused,
  waitForDispatch,
  setupTestRunner,
  initDebugger
} = require("../utils");

module.exports = async function breaking(ctx) {
  const { ok, is } = ctx;
  const dbg = await initDebugger("doc-scripts.html", "scripts.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  // Make sure we can set a top-level breakpoint and it will be hit on
  // reload.
  await addBreakpoint(dbg, "scripts.html", 18);
  reload(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "scripts.html", 18);
  await resume(dbg);

  const paused = waitForPaused(dbg);

  // Create an eval script that pauses itself.
  invokeInTab(dbg, "doEval");

  await paused;
  await resume(dbg);
  const source = getSelectedSource(getState()).toJS();
  ok(!source.url, "It is an eval source");

  await addBreakpoint(dbg, source, 5);
  invokeInTab(dbg, "evaledFunc");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, source, 5);
};
