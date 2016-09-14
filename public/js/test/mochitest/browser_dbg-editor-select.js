/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor highlights the correct location when the
// debugger pauses

// checks to see if the first breakpoint is visible
function isElementVisible(dbg, elementName) {
  const bpLine = findElement(dbg, elementName);
  const cm = findElement(dbg, "codeMirror");
  return bpLine && isVisibleWithin(cm, bpLine);
}

add_task(function* () {
  const dbg = yield initDebugger(
    "doc-scripts.html",
    "simple1.js", "simple2.js", "long.js"
  );
  const { selectors: { getSelectedSource, getSourceText }, getState } = dbg;
  const simple1 = findSource(dbg, "simple1.js");
  const simple2 = findSource(dbg, "simple2.js");

  // Set the initial breakpoint.
  yield addBreakpoint(dbg, simple1, 4);
  ok(!getSelectedSource(getState()), "No selected source");

  // Call the function that we set a breakpoint in.
  invokeInTab("main");
  yield waitForPaused(dbg);
  assertPausedLocation(dbg, simple1, 4);

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
  let longSrc = findSource(dbg, "long.js");
  yield addBreakpoint(dbg, longSrc, 66);

  invokeInTab("testModel");
  yield waitForPaused(dbg);
  assertPausedLocation(dbg, longSrc, 66);
  ok(isElementVisible(dbg, "breakpoint"), "Breakpoint is visible");

  // Remove the current breakpoint and add another on line 16.
  yield removeBreakpoint(dbg, longSrc.id, 66);
  yield addBreakpoint(dbg, longSrc, 16);

  // Jump to line 16 and make sure the breakpoint is visible. We only
  // added the breakpoint so we could make sure it scrolled correctly.
  yield selectSource(dbg, longSrc.url, 16);
  ok(isElementVisible(dbg, "breakpoint"), "Breakpoint is visible");
  ok(isElementVisible(dbg, "highlightLine"), "Highlighted line is visible");
  ok(findElement(dbg, "highlightLine").innerHTML.match(/Utils.*uuid/),
     "The correct line is highlighted");

  // Make sure only one line is ever highlighted and the flash
  // animation is cancelled on old lines.
  yield selectSource(dbg, longSrc.url, 17);
  yield selectSource(dbg, longSrc.url, 18);
  is(findAllElements(dbg, "highlightLine").length, 1,
     "Only 1 line is highlighted");

  // Test jumping to a line in a source that hasn't been loaded yet.
  // First, reset the UI by selecting the simple1 source and reloading
  // so that it's selected by default.
  yield selectSource(dbg, simple1.url);
  reload(dbg, simple1.url);
  yield waitForDispatch(dbg, "LOAD_SOURCE_TEXT");

  // Then, make sure the long source exists and select a line in it.
  yield waitForSources(dbg, "long.js");
  longSrc = findSource(dbg, "long.js");
  selectSource(dbg, longSrc.url, 16);

  // Make sure the source is in the loading state, wait for it to be
  // fully loaded, and check the highlighted line.
  ok(getSourceText(dbg.getState(), longSrc.id).get("loading"));
  yield waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  ok(getSourceText(dbg.getState(), longSrc.id).get("text"));
  const line = findElement(dbg, "highlightLine");
  ok(line, "Line is highlighted");
  ok(line.innerHTML.match(/Utils.*uuid/),
     "The correct line is highlighted");
});
