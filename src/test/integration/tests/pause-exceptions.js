const {
  initDebugger,
  assertPausedLocation,
  invokeInTab,
  togglePauseOnExceptions,
  waitForPaused,
  isPaused,
  resume,
  reload,
} = require("../utils");

function uncaughtException(dbg) {
  return invokeInTab(dbg, "uncaughtException").catch(() => {});
}

function caughtException(dbg) {
  return invokeInTab(dbg, "caughtException");
}

function assertPOEState(dbg, ctx, pause, ignore) {
  const { is } = ctx;
  const {
    getState,
    selectors: {
      getShouldPauseOnExceptions,
      getShouldIgnoreCaughtExceptions,
    },
  } = dbg;

  is(getShouldPauseOnExceptions(getState()), pause);
  is(getShouldIgnoreCaughtExceptions(getState()), ignore);
}

/*
  Tests Pausing on exception
  1. skip an uncaught exception
  2. pause on an uncaught exception
  3. pause on a caught error
  4. skip a caught error
*/
async function testButton(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger("doc-exceptions.html");

  // test skipping an uncaught exception
  await togglePauseOnExceptions(dbg, false, false);
  await uncaughtException(dbg);
  ok(!isPaused(dbg));

  // Test pausing on an uncaught exception
  await togglePauseOnExceptions(dbg, true, false);
  uncaughtException(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "exceptions.js", 2);
  await resume(dbg);

  // Test pausing on a caught Error
  await togglePauseOnExceptions(dbg, true, false);
  caughtException(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "exceptions.js", 15);
  await resume(dbg);

  // Test skipping a caught error
  await togglePauseOnExceptions(dbg, true, true);
  caughtException(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "exceptions.js", 17);
  await resume(dbg);
}

async function testReloading(ctx) {
  const { ok, is, info } = ctx;

  let dbg = await initDebugger("doc-exceptions.html");

  await togglePauseOnExceptions(dbg, true, false);
  dbg = await initDebugger("doc-exceptions.html");
  assertPOEState(dbg, ctx, true, false);
}

module.exports = {
  testButton,
  testReloading,
};
