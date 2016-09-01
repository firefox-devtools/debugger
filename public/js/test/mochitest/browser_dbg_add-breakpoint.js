/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const TAB_URL = EXAMPLE_URL + "doc_simple.html";

add_task(function* () {
  const dbg = yield initDebugger(TAB_URL, "code_simple.js");
  const { actions, getState, selectors } = dbg;

  const source = findSource(dbg, "code_simple.js");

  yield addBreakpoint(dbg, source.id, 4);

  ContentTask.spawn(gBrowser.selectedBrowser, null, function* () {
    content.wrappedJSObject.foo();
  });

  yield waitForPaused(dbg);
  yield stepIn(dbg);
  yield selectSource(dbg, "code_simple2.js");

  yield resume(dbg);
  ok(true);
});
