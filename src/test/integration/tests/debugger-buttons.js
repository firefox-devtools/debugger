const {
  initDebugger,
  assertPausedLocation,
  waitForPaused,
  invokeInTab,
  clickElement,
  findElement,
  reload
} = require("../utils");

function clickStepOver(dbg) {
  clickElement(dbg, "stepOver");
  return waitForPaused(dbg);
}

function clickStepIn(dbg) {
  clickElement(dbg, "stepIn");
  return waitForPaused(dbg);
}

function clickStepOut(dbg) {
  clickElement(dbg, "stepOut");
  return waitForPaused(dbg);
}

/**
 * Test debugger buttons
 *  1. resume
 *  2. stepOver
 *  3. stepIn
 *  4. stepOver to the end of a function
 *  5. stepUp at the end of a function
 */
module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-debugger-statements.html");

  await reload(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 8);

  // resume
  clickElement(dbg, "resume");
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 12);

  // step over
  await clickStepOver(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 13);

  // step into
  await clickStepIn(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 18);

  // step over
  await clickStepOver(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 20);

  // step out
  await clickStepOut(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 20);
};
