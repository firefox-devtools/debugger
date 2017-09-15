/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * Test debugging a page with iframes
 *  1. pause in the main thread
 *  2. pause in the iframe
 */
add_task(async function() {
  const dbg = await initDebugger("doc-iframes.html");

  // test pausing in the main thread
  await reload(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  // test pausing in the iframe
  await resume(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg);

  // test pausing in the iframe
  await resume(dbg);
  await waitForPaused(dbg);
  assertPausedLocation(dbg);
});
