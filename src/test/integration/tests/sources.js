const {
  initDebugger,
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
  waitUntil
} = require("../utils");

// Tests that the source tree works.

async function waitForSourceCount(dbg, i) {
  // We are forced to wait until the DOM nodes appear because the
  // source tree batches its rendering.
  await waitUntil(() => {
    return findAllElements(dbg, "sourceNodes").length === i;
  });
}

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;

  const dbg = await initDebugger("doc-sources.html");
  const { selectors: { getSelectedSource }, getState } = dbg;

  await waitForSources(
    dbg, "simple1", "simple2", "nested-source", "long.js"
  );

  // Expand nodes and make sure more sources appear.
  is(findAllElements(dbg, "sourceNodes").length, 2);

  clickElement(dbg, "sourceArrow", 2);
  is(findAllElements(dbg, "sourceNodes").length, 7);

  clickElement(dbg, "sourceArrow", 3);
  is(findAllElements(dbg, "sourceNodes").length, 8);

  // Select a source.
  ok(
    !findElementWithSelector(dbg, ".sources-list .focused"),
    "Source is not focused"
   );

  const selected = waitForDispatch(dbg, "SELECT_SOURCE");
  clickElement(dbg, "sourceNode", 4);
  await selected;

  ok(
    findElementWithSelector(dbg, ".sources-list .focused"),
    "Source is focused"
  );

  ok(
    getSelectedSource(getState()).get("url").includes("nested-source.js"),
    "The right source is selected"
  );

  // Make sure new sources appear in the list.
  invokeInTab(dbg, "loadScript")

  await waitForSourceCount(dbg, 9);

  is(
    findElement(dbg, "sourceNode", 7).textContent,
    "math.min.js",
    "The dynamic script exists"
  );

  // Make sure named eval sources appear in the list.
  evalInTab(
    dbg,
    "window.evaledFunc = function() {} //# sourceURL=evaled.js"
  )

  await waitForSourceCount(dbg, 11);
  debugger

  is(
    findElement(dbg, "sourceNode", 2).textContent,
     "evaled.js",
     "The eval script exists"
   );
}
