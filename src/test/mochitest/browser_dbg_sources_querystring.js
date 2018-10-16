/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the source tree works.

function getLabel(dbg, index) {
  return findElement(dbg, "sourceNode", index)
    .textContent.trim()
    .replace(/^[\s\u200b]*/g, "");
}

add_task(async function() {
  const dbg = await initDebugger("doc-sources-querystring.html");
  const {
    selectors: { getSelectedSource },
    getState
  } = dbg;

  await waitForSources(dbg, "simple1.js?x=1", "simple1.js?x=2");

  debugger;

  // Expand nodes and make sure more sources appear.
  await assertSourceCount(dbg, 2);
  await clickElement(dbg, "sourceDirectoryLabel", 2);

  is(
    getLabel(dbg, 7),
    "simple1.js?x=1",
    "simple1.js?x=1 exists"
  );
  is(
    getLabel(dbg, 8),
    "simple1.js?x=2",
    "simple1.js?x=2 exists"
  );
});
