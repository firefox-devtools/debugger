/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests the search bar correctly responds to queries, enter, shift enter

function waitForDebounce() {
  return new Promise(re => setTimeout(re, 200));
}

function getFocusedEl(dbg) {
  let doc = dbg.win.document;
  return doc.activeElement;
}

add_task(function*() {
  const dbg = yield initDebugger("doc-scripts.html");
  const { selectors: { getBreakpoints, getBreakpoint }, getState } = dbg;
  const source = findSource(dbg, "simple1.js");

  yield selectSource(dbg, source.url);

  const cm = getCM(dbg);
  pressKey(dbg, "fileSearch");
  const el = getFocusedEl(dbg);

  type(dbg, "con");
  yield waitForDebounce();

  const state = cm.state.search;

  pressKey(dbg, "Enter");
  is(state.posFrom.line, 3);

  pressKey(dbg, "Enter");
  is(state.posFrom.line, 4);

  pressKey(dbg, "ShiftEnter");
  is(state.posFrom.line, 3);

  pressKey(dbg, "fileSearch");
  type(dbg, "fun");

  pressKey(dbg, "Enter");
  is(state.posFrom.line, 4);

  // selecting another source keeps search open
  yield selectSource(dbg, "simple2");
  pressKey(dbg, "Enter");
  is(state.posFrom.line, 0);
});
