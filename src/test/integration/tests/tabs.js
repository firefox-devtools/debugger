const {
  initDebugger,
  reload,
  selectSource,
  waitForDispatch
} = require("../utils");

function countTabs(dbg) {
  return dbg.selectors.getSourceTabs(dbg.getState()).size;
}

module.exports = async function(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  const dbg = await initDebugger("doc-scripts.html", "simple1", "simple2");

  selectSource(dbg, "simple1");
  selectSource(dbg, "simple2");

  expect(countTabs(dbg)).to.equal(2);
  await reload(dbg, "simple2");
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");

  // NOTE: when we fix persisted tabs we should have two
  expect(countTabs(dbg)).to.equal(1);
};
