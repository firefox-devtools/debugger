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

async function expandingProperties(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger(
    "doc-script-switching.html",
    "script-switching-01",
    "script-switching-02"
  );

  toggleScopes(dbg);
  invokeInTab(dbg, "firstCall");

  await waitForPaused(dbg);

  is(getLabel(dbg, 1), "secondCall");
  is(getLabel(dbg, 2), "<this>");
  is(getLabel(dbg, 4), "foo()");

  toggleNode(dbg, 4);
  await waitForDispatch(dbg, "LOAD_OBJECT_PROPERTIES");
  is(getLabel(dbg, 5), "length");

  await stepOver(dbg);
  is(getLabel(dbg, 4), "foo()");
  is(getLabel(dbg, 5), "Window");
}

async function changingScopes(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger(
    "doc-script-switching.html",
    "script-switching-01",
    "script-switching-02"
  );

  toggleScopes(dbg);
  invokeInTab(dbg, "firstCall");

  await waitForPaused(dbg);

  clickElement(dbg, "frame", 2);
  is(getLabel(dbg, 1), "firstCall");
  is(getLabel(dbg, 2), "<this>");

  toggleNode(dbg, 2);
  await waitForDispatch(dbg, "LOAD_OBJECT_PROPERTIES");
  is(getLabel(dbg, 5), "CSS2Properties()");
}

module.exports = {
  expandingProperties,
  changingScopes
};
