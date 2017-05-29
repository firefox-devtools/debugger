const {
  initDebugger,
  assertPausedLocation,
  findElement,
  findSource,
  selectSource,
  clickElement,
  addBreakpoint,
  waitForDispatch
} = require("../utils");

function toggleBreakpoint(dbg, index) {
  const bp = findElement(dbg, "breakpointItem", index);
  const input = bp.querySelector("input");
  input.click();
}

async function removeBreakpoint(dbg, index) {
  const bp = findElement(dbg, "breakpointItem", index);
  bp.querySelector(".close-btn").click();
  await waitForDispatch(dbg, "REMOVE_BREAKPOINT");
}

async function disableBreakpoint(dbg, index) {
  toggleBreakpoint(dbg, index);
  await waitForDispatch(dbg, "DISABLE_BREAKPOINT");
}

async function enableBreakpoint(dbg, index) {
  toggleBreakpoint(dbg, index);
  await waitForDispatch(dbg, "ENABLE_BREAKPOINT");
}

async function toggleBreakpoints(dbg) {
  clickElement(dbg, "toggleBreakpoints");
  await waitForDispatch(dbg, "TOGGLE_BREAKPOINTS");
}

function findBreakpoint(dbg, url, line) {
  const { selectors: { getBreakpoint }, getState } = dbg;
  const source = findSource(dbg, url);
  return getBreakpoint(getState(), { sourceId: source.id, line });
}

function findBreakpoints(dbg) {
  const { selectors: { getBreakpoints }, getState } = dbg;
  return getBreakpoints(getState());
}

async function toggle(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger("doc-scripts.html", "simple2");

  // Create two breakpoints
  await selectSource(dbg, "simple2");
  await addBreakpoint(dbg, "simple2", 3);
  await addBreakpoint(dbg, "simple2", 5);

  // Disable the first one
  await disableBreakpoint(dbg, 1);
  let bp1 = findBreakpoint(dbg, "simple2", 3);
  let bp2 = findBreakpoint(dbg, "simple2", 5);
  is(bp1.disabled, true, "first breakpoint is disabled");
  is(bp2.disabled, false, "second breakpoint is enabled");

  // Disable and Re-Enable the second one
  await disableBreakpoint(dbg, 2);
  await enableBreakpoint(dbg, 2);
  bp2 = findBreakpoint(dbg, "simple2", 5);
  is(bp2.disabled, false, "second breakpoint is enabled");
}

// toggle all
async function toggleAll(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger("doc-scripts.html");

  // Create two breakpoints
  await selectSource(dbg, "simple2");
  await addBreakpoint(dbg, "simple2", 3);
  await addBreakpoint(dbg, "simple2", 5);

  // Disable all of the breakpoints
  await toggleBreakpoints(dbg);
  let bp1 = findBreakpoint(dbg, "simple2", 3);
  let bp2 = findBreakpoint(dbg, "simple2", 5);
  is(bp1.disabled, true, "first breakpoint is disabled");
  is(bp2.disabled, true, "second breakpoint is disabled");

  // Enable all of the breakpoints
  await toggleBreakpoints(dbg);
  bp1 = findBreakpoint(dbg, "simple2", 3);
  bp2 = findBreakpoint(dbg, "simple2", 5);
  is(bp1.disabled, false, "first breakpoint is enabled");
  is(bp2.disabled, false, "second breakpoint is enabled");

  // Remove the breakpoints
  await removeBreakpoint(dbg, 1);
  await removeBreakpoint(dbg, 1);
  const bps = findBreakpoints(dbg);
  is(bps.size, 0, "breakpoints are removed");
}

module.exports = {
  toggle,
  toggleAll
};
