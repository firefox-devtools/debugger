const {
  initDebugger,
  waitForPaused,
  invokeInTab,
  clickElement,
  findElement
} = require("../utils")

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
  const dbg = await initDebugger("doc-script-switching.html");

  toggleScopes(dbg);

  invokeInTab(dbg, "firstCall");
  await waitForPaused(dbg);

  is(getLabel(dbg, 1), "secondCall");
  is(getLabel(dbg, 2), "<this>");
}
