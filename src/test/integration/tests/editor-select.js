const {
  initDebugger,
  assertPausedLocation,
  findSource,
  addBreakpoint,
  waitForPaused,
  invokeInTab,
  clickElement,
  findElement,
  stepIn,
  stepOut,
  resume,
  isVisibleWithin
} = require("../utils")

// Tests that the editor highlights the correct location when the
// debugger pauses

// checks to see if the first breakpoint is visible
function isElementVisible(dbg, elementName) {
  const bpLine = findElement(dbg, elementName);
  const cm = findElement(dbg, "codeMirror");
  return bpLine && isVisibleWithin(cm, bpLine);
}

module.exports = async function(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  // This test runs too slowly on linux debug. I'd like to figure out
  // which is the slowest part of this and make it run faster, but to
  // fix a frequent failure allow a longer timeout.
  requestLongerTimeout(2);

  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getSelectedSource }, getState } = dbg;
  const simple1 = findSource(dbg, "simple1.js");
  const simple2 = findSource(dbg, "simple2.js");

  // Set the initial breakpoint.
  await addBreakpoint(dbg, simple1, 4);
  ok(!getSelectedSource(getState()), "No selected source");

  // Call the function that we set a breakpoint in.
  invokeInTab(dbg, "main");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, simple1, 4);

  // Step through to another file and make sure it's paused in the
  // right place.
  await stepIn(dbg);
  assertPausedLocation(dbg, ctx, simple2, 2);

  // Step back out to the initial file.
  await stepOut(dbg);
  await stepOut(dbg);
  assertPausedLocation(dbg, ctx, simple1, 5);
  await resume(dbg);

  // Make sure that we can set a breakpoint on a line out of the
  // viewport, and that pausing there scrolls the editor to it.
  let longSrc = findSource(dbg, "long.js");
  await addBreakpoint(dbg, longSrc, 66);

  invokeInTab(dbg, "testModel");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, longSrc, 66);
  ok(isElementVisible(dbg, "breakpoint"), "Breakpoint is visible");
}
