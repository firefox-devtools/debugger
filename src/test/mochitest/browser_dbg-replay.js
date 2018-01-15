/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function clickButton(dbg, button) {
  const resumeFired = waitForDispatch(dbg, "COMMAND");
  clickElement(dbg, button);
  return resumeFired;
}

async function clickStepOver(dbg) {
  await clickButton(dbg, "stepOver");
  return waitForPaused(dbg);
}

async function clickStepBack(dbg) {
  await clickButton(dbg, "replay-previous");
  return waitForPaused(dbg);
}

async function clickStepForward(dbg) {
  await clickButton(dbg, "replayNext");
  return waitForPaused(dbg);
}

async function clickStepIn(dbg) {
  await clickButton(dbg, "stepIn");
  return waitForPaused(dbg);
}

async function clickStepOut(dbg) {
  await clickButton(dbg, "stepOut");
  return waitForPaused(dbg);
}

async function clickResume(dbg) {
  return clickButton(dbg, "resume");
}

/**
 * Test debugger replay buttons
 *  1. pause
 *  2. step back
 *  3. step Forward
 *  4. resume
 */
add_task(async function() {
  const dbg = await initDebugger("doc-debugger-statements.html");

  await reload(dbg);
  await waitForPaused(dbg);
  await waitForLoadedSource(dbg, "debugger-statements.html");
  assertPausedLocation(dbg);

  // resume
  await clickResume(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  // step over
  await clickStepOver(dbg);
  assertPausedLocation(dbg);

  // step into
  await clickStepIn(dbg);
  assertPausedLocation(dbg);

  // step over
  await clickStepOver(dbg);
  assertPausedLocation(dbg);

  // step out
  await clickStepOut(dbg);
  assertPausedLocation(dbg);
  debugger;
});
