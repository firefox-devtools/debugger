/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests that the source tree works.

async function waitForSourceCount(dbg, i) {
  // We are forced to wait until the DOM nodes appear because the
  // source tree batches its rendering.
  await waitUntil(() => {
    return findAllElements(dbg, "sourceNodes").length === i;
  });
}

async function assertSourceCount(dbg, count) {
  await waitForSourceCount(dbg, count);
  is(findAllElements(dbg, "sourceNodes").length, count, `${count} sources`);
}

function getLabel(dbg, index) {
  return findElement(dbg, "sourceNode", index)
    .textContent.trim()
    .replace(/^[\s\u200b]*/g, "");
}

add_task(async function() {
  const dbg = await initDebugger("doc-sources.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  await waitForSources(dbg, "simple1", "simple2", "nested-source", "long.js");

  // Expand nodes and make sure more sources appear.
  await assertSourceCount(dbg, 2);
  await clickElement(dbg, "sourceArrow", 2);

  await assertSourceCount(dbg, 7);
  await clickElement(dbg, "sourceDirectory", 3);
  await assertSourceCount(dbg, 8);

  // Select a source
  ok(
    !findElementWithSelector(dbg, ".sources-list .focused"),
    "Source is not focused"
  );
  const selected = waitForDispatch(dbg, "SELECT_SOURCE");
  await clickElement(dbg, "sourceNode", 4);
  await selected;
  ok(
    findElementWithSelector(dbg, ".sources-list .focused"),
    "Source is focused"
  );
  ok(
    getSelectedSource(getState())
      .get("url")
      .includes("nested-source.js"),
    "The right source is selected"
  );

  // Make sure new sources appear in the list.
  ContentTask.spawn(gBrowser.selectedBrowser, null, function() {
    const script = content.document.createElement("script");
    script.src = "math.min.js";
    content.document.body.appendChild(script);
  });

  await waitForSourceCount(dbg, 9);
  is(
    getLabel(dbg, 7),
    "math.min.js",
    "math.min.js - The dynamic script exists"
  );
});
