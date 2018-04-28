/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the editor will not highight a line instantly after selecting a source,
// no matter if the source text doesn't exist yet or even if the source
// doesn't exist.

add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html");
  const { selectors: { getSource }, getState } = dbg;
  const sourceUrl = EXAMPLE_URL + "long.js";

  // The source itself doesn't even exist yet, and using
  // `selectSourceURL` will set a pending request to load this source
  // and highlight a specific line.

  await selectSource(dbg, sourceUrl, 66)

  log(`Select line 16 and make sure the editor scrolled.`);
  await selectSource(dbg, "long.js", 16);
  await waitForElementWithSelector(dbg, ".CodeMirror-code > .highlight-line");
  assertNoHighlightLocation(dbg, "long.js", 16);

  log(`Select several locations and check that we have no highlight`);
  await selectSource(dbg, "long.js", 17);
  await selectSource(dbg, "long.js", 18);
  assertNoHighlightLocation(dbg, "long.js", 18);

  // Test jumping to a line in a source that exists but hasn't been
  // loaded yet.
  log(`Select an unloaded source`);
  selectSource(dbg, "simple1.js", 6);

  // Make sure the source is in the loading state, wait for it to be
  // fully loaded, and check that the line is not highlighted.
  const simple1 = findSource(dbg, "simple1.js");
  is(getSource(getState(), simple1.id).get("loadedState"), "loading");

  await waitForSelectedSource(dbg, "simple1.js");
  ok(getSource(getState(), simple1.id).text);
  assertNoHighlightLocation(dbg, "simple1.js", 6);
});
