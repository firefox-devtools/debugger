const {
  initDebugger,
  assertPausedLocation,
  invokeInTab,
  togglePauseOnExceptions,
  waitForPaused,
  isPaused,
  resume
} = require("../utils");

function uncaughtException(dbg) {
  return invokeInTab(dbg, "uncaughtException").catch(() => {});
}

function caughtException(dbg) {
  return invokeInTab(dbg, "caughtException");
}

/*
  Tests Pausing on exception
  1. skip an uncaught exception
  2. pause on an uncaught exception
  3. pause on a caught error
  4. skip a caught error
*/
module.exports = async function(ctx) { const { ok, is, info } = ctx;

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
