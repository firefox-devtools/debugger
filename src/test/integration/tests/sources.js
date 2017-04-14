const {
  initDebugger,
  environment,
  clickElement,
  invokeInTab,
  pressKey,
  selectSource,
  evalInTab,
  findElement,
  findAllElements,
  findElementWithSelector,
  waitForSources,
  waitForDispatch,
  waitUntil,
  waitForTime
} = require("../utils");

// Tests that the source tree works.

function countSources(dbg) {
  return findAllElements(dbg, "sourceNodes").length;
}

function toggleDirectory(dbg, index) {
  return clickElement(dbg, "sourceArrow", index);
}

function clickNode(dbg, index) {
  return clickElement(dbg, "sourceNode", index);
}

function getSourceNode(dbg, index) {
  return findElement(dbg, "sourceNode", index).textContent;
}

function getFocusedNode(dbg) {
  return findElementWithSelector(dbg, ".sources-list .focused");
}

async function waitForSourceCount(dbg, i) {
  // We are forced to wait until the DOM nodes appear because the
  // source tree batches its rendering.
  await waitUntil(() => {
    return countSources(dbg) === i;
  });
}

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-sources.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  await waitForSources(
    dbg,
    "simple1",
    "simple2",
    "nested-source",
    "long.js",
    "doc-sources.html"
  );

  // wait for source render to debounce
  await waitForTime(200);

  // Expand nodes and make sure more sources appear.
  is(countSources(dbg), 2);

  toggleDirectory(dbg, 2);
  is(countSources(dbg), 7);

  toggleDirectory(dbg, 3);

  is(countSources(dbg), 8);

  // Select a source.
  ok(!getFocusedNode(dbg), "Source is not focused");

  const selected = waitForDispatch(dbg, "SELECT_SOURCE");
  clickNode(dbg, 4);
  await selected;

  ok(getFocusedNode(dbg), "Source is focused");

  ok(
    getSelectedSource(getState()).get("url").includes("nested-source.js"),
    "The right source is selected"
  );

  // Make sure new sources appear in the list.
  invokeInTab(dbg, "loadScript");
  await waitForSourceCount(dbg, 9);

  is(getSourceNode(dbg, 7), "math.min.js", "The dynamic script exists");

  if (environment == "mochitest") {
    // Make sure named eval sources appear in the list.
    evalInTab(dbg, "window.evaledFunc = function() {} //# sourceURL=evaled.js");

    await waitForSourceCount(dbg, 11);
    is(
      findElement(dbg, "sourceNode", 2).textContent,
      "evaled.js",
      "The eval script exists"
    );
  }
};
