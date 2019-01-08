/* Any copyright is dedicated to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/ */

/*
 * Test reloading:
 * 1. reload the source
 * 2. re-sync breakpoints
 */

async function waitForBreakpoint(dbg, location) {
  return waitForState(
    dbg,
    state => {
      return dbg.selectors.getBreakpoint(dbg.getState(), location);
    },
    "Waiting for breakpoint"
  );
}

add_task(async function() {
  const dbg = await initDebugger("ember/quickstart/dist/", "ember-application/index.js");

  await selectSource(dbg, "ember-application/index.js");

  info("1. reload and hit breakpoint")
  await addBreakpoint(dbg, "ember-application/index.js", 4);
  reload(dbg, "ember/quickstart/dist/");

  info("2. Wait for sources to appear and then reload")
  await waitForDispatch(dbg, "ADD_SOURCES")
  reload(dbg, "ember/quickstart/dist/");


  info("3. Wait for sources to appear and then reload mid source-maps")
  await waitForDispatch(dbg, "ADD_SOURCES");
  reload(dbg, "ember/quickstart/dist/");

  info("4. wait for the debugger to pause and show that we're in the correct location")
  await waitForPaused(dbg)
  assertPausedLocation(dbg, "ember-application/index.js", 4);
});
