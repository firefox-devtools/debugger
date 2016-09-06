/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor highlights the correct location when the
// debugger pauses

const TAB_URL = EXAMPLE_URL + "doc-scripts.html";

function assertPausedLocation(dbg, source, line) {
  const { selectors: { getSelectedSource, getPause }, getState } = dbg;

  is(getSelectedSource(getState()).get("url"), source.url);
  const location = getPause(getState()).getIn(["frame", "location"]);
  is(location.get("sourceId"), source.id);
  is(location.get("line"), line);

  ok(dbg.win.cm.lineInfo(line - 1).wrapClass.includes("debug-line"),
     "Line is highlighted");
}

add_task(function* () {
  const dbg = yield initDebugger(
    TAB_URL,
    "simple1.js", "simple2.js", "long.js"
  );
  const { selectors: { getSelectedSource }, getState } = dbg;
  const simple1 = findSource(dbg, "simple1.js");
  const simple2 = findSource(dbg, "simple2.js");

  // Set the initial breakpoint.
  yield addBreakpoint(dbg, simple1.id, 4);
  ok(!getSelectedSource(getState()), "No selected source");

  // Call the function that we set a breakpoint in.
  ContentTask.spawn(gBrowser.selectedBrowser, null, function* () {
    content.wrappedJSObject.main();
  });

  // Make sure that it pauses in the expected source.
  yield waitForPaused(dbg);
  is(getSelectedSource(getState()).get("url"), simple1.url);

  // Step through to another file and make sure it's paused in the
  // right place.
  yield stepIn(dbg);
  assertPausedLocation(dbg, simple2, 2);

  // Step back out to the initial file.
  yield stepOut(dbg);
  yield stepOut(dbg);
  assertPausedLocation(dbg, simple1, 5);
  yield resume(dbg);

  // Make sure that we can set a breakpoint on a line out of the
  // viewport, and that pausing there scrolls the editor to it.
  const longSrc = findSource(dbg, "long.js");
  yield addBreakpoint(dbg, longSrc.id, 66);

  ContentTask.spawn(gBrowser.selectedBrowser, null, function* () {
    content.wrappedJSObject.testModel();
  });

  yield waitForPaused(dbg);
  assertPausedLocation(dbg, longSrc, 66);

  // Make sure that the breakpoint icon is literally visible.
  const doc = dbg.win.document;
  const bpLine = doc.querySelector(".CodeMirror-code > .new-breakpoint");
  const cm = doc.querySelector(".CodeMirror");
  ok(isVisibleWithin(cm, bpLine), "CodeMirror is scrolled to line");
});
