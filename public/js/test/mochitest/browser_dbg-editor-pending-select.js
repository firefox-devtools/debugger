/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor will select the right source and line even if
// the source doesn't exist yet. This is the workflow that happens
// when you click on a location in the console and the debugger isn't
// initialized yet.

add_task(function* () {
  const dbg = yield initDebugger("doc-scripts.html");
  const sourceUrl = EXAMPLE_URL + "code-long.js";

  // The source probably hasn't been loaded yet, and using
  // `selectSourceURL` will set a pending request to load this source
  // and highlight a specific line.
  dbg.actions.selectSourceURL(sourceUrl, { line: 66 });

  // Wait for the source text to load and make sure we're in the right
  // place.
  yield waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  assertHighlightLocation(dbg, sourceUrl, 66);
});
