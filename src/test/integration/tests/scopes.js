const {
  initDebugger,
  waitForPaused,
  invokeInTab,
  evalInTab,
  clickElement,
  findElement,
  waitForTime,
  waitForDispatch,
  stepOver
} = require("../utils");

function toggleNode(dbg, index) {
  clickElement(dbg, "scopeNode", index);
}

function getLabel(dbg, index) {
  return findElement(dbg, "scopeNode", index).innerText;
}

function toggleScopes(dbg) {
  return findElement(dbg, "scopesHeader").click();
}

module.exports = async function(ctx) {
  const { ok, is, info } = ctx;
  console.log(">>> starting");
  const dbg = await initDebugger(
    "doc-script-switching.html",
    "script-switching-01",
    "script-switching-02"
  );

  toggleScopes(dbg);
  invokeInTab(dbg, "firstCall");

  await waitForPaused(dbg);
  console.log(">>> first call and paused");

  is(getLabel(dbg, 1), "secondCall");
  is(getLabel(dbg, 2), "<this>");
  is(getLabel(dbg, 4), "foo()");

  toggleNode(dbg, 4);
  await waitForDispatch(dbg, "LOAD_OBJECT_PROPERTIES");
  is(getLabel(dbg, 5), "prototype");

  await stepOver(dbg);
  is(getLabel(dbg, 4), "foo()");
  is(getLabel(dbg, 5), "prototype");
};
