const {
  initDebugger,
  assertPausedLocation,
  reload,
  resume,
  waitForPaused
} = require("../utils");

/**
 * Test debugging a page with iframes
 *  1. pause in the main thread
 *  2. pause in the iframe
 */
module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-iframes.html");

  // test pausing in the main thread
  await reload(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "iframes.html", 8);

  // test pausing in the iframe
  await resume(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 8);

  // test pausing in the iframe
  await resume(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "debugger-statements.html", 12);
}
