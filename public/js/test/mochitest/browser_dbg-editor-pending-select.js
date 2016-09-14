/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor will select the right source and line even if
// the source doesn't exist yet. This is the workflow that happens
// when you click on a location in the console and the debugger isn't
// initialized yet.

function openConsole() {
  return openNewTabAndToolbox(
    EXAMPLE_URL + url,
    "webconsole"
  );
}

add_task(function* () {
  const dbg = yield initDebugger("doc-scripts.html");
  const { selectors: { getSelectedSource }, getState } = dbg;
  const sourceUrl = EXAMPLE_URL + "code-long.js";

  // The source probably hasn't been loaded yet, and using
  // `selectSourceURL` will set a pending request to load this source
  // and highlight a specific line.
  dbg.actions.selectSourceURL(sourceUrl, { line: 66 });

  // Wait for the source text to load and make sure we're in the right
  // place.
  yield waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  is(getSelectedSource(getState()).get("url"), sourceUrl);
  const line = findElement(dbg, "highlightLine");
  ok(line, "Line is highlighted");
  ok(line.innerHTML.match(/this.*todos.*filter/),
     "The correct line is highlighted");
});
