/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor sets the correct mode for different file
// types

const TAB_URL = EXAMPLE_URL + "doc-scripts.html";

add_task(function* () {
  const dbg = yield initDebugger(TAB_URL, "simple1.js", "doc-scripts.html");

  yield selectSource(dbg, "simple1.js");
  is(dbg.win.cm.getOption("mode").name, "javascript", "Mode is correct");

  yield selectSource(dbg, "doc-scripts.html");
  is(dbg.win.cm.getOption("mode").name, "htmlmixed", "Mode is correct");
});
