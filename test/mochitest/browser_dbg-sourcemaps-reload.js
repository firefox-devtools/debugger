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

function getBreakpoints(dbg) {
  return dbg.selectors.getBreakpointsList(dbg.getState());
}

add_task(async function() {
  const dbg = await initDebugger("doc-minified.html");

  await navigate(dbg, "sourcemaps-reload/doc-sourcemaps-reload.html", "v1.js");

  info('Add initial breakpoint');
  await selectSource(dbg, "v1.js");
  await addBreakpoint(dbg, "v1.js", 6);

  let breakpoint = getBreakpoints(dbg)[0];
  is(breakpoint.location.line, 6);

  info('Reload with a new version of the file');
  let syncBp = waitForDispatch(dbg, "SYNC_BREAKPOINT");
  await navigate(dbg, "doc-sourcemaps-reload2.html", "v1.js");

  await syncBp;
  breakpoint = getBreakpoints(dbg)[0];

  is(breakpoint.location.line, 9);
  is(breakpoint.generatedLocation.line, 79);

  info('Add a second breakpoint');
  await addBreakpoint(dbg, "v1.js", 13);
  is(dbg.selectors.getBreakpointCount(dbg.getState()), 2, "No breakpoints");


  // NOTE: When we reload, the `foo` function and the
  // module is no longer 13 lines long
  info('Reload and observe no breakpoints')
  syncBp = waitForDispatch(dbg, "SYNC_BREAKPOINT", 2);
  await navigate(dbg, "doc-sourcemaps-reload3.html", "v1.js");
  await waitForSource(dbg, "v1");
  await syncBp;

  is(getBreakpoints(dbg).length, 0, "No breakpoints");
});
