/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests pretty-printing a source that is currently paused.

add_task(function*() {
  const dbg = yield initDebugger("doc-minified.html");

  yield selectSource(dbg, "math.min.js");
  yield addBreakpoint(dbg, "math.min.js", 2);

  invokeInTab("arithmetic");
  yield waitForPaused(dbg);
  // this is what the behavior should be
  // assertPausedLocation(dbg, "math.min.js", 2);
  assertPausedLocation(dbg, "math.min.js:formatted", 18);

  clickElement(dbg, "prettyPrintButton");
  yield waitForDispatch(dbg, "SELECT_SOURCE");

  assertPausedLocation(dbg, "math.min.js:formatted", 18);

  yield resume(dbg);
});
