const {
  initDebugger,
  reload,
  selectSource,
  findElement,
  waitForDispatch,
  closeTab
} = require("../utils");

function countTabs(dbg) {
  return findElement(dbg, "sourceTabs").children.length;
}

export async function addTabs(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  let dbg = await initDebugger("doc-scripts.html", "simple1", "simple2");

  await selectSource(dbg, "simple1");
  await selectSource(dbg, "simple2");
  expect(countTabs(dbg)).to.equal(2);

  // Test reloading the debugger
  dbg = await initDebugger("doc-scripts.html", "simple1", "simple2");
  expect(countTabs(dbg)).to.equal(2);
  await selectSource(dbg, "simple2");

  // Test reloading the debuggee
  await reload(dbg, "simple1", "simple2");
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  expect(countTabs(dbg)).to.equal(2);
}

export async function reloadWithTabs(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  let dbg = await initDebugger("doc-scripts.html", "simple1", "simple2");

  await selectSource(dbg, "simple1");
  await selectSource(dbg, "simple2");
  expect(countTabs(dbg)).to.equal(2);

  // Test reloading the debugger
  await reload(dbg, "simple1", "simple2");
  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  expect(countTabs(dbg)).to.equal(2);
}

export async function reloadWithNoTabs(ctx) {
  const { ok, is, info, requestLongerTimeout } = ctx;

  let dbg = await initDebugger("doc-scripts.html", "simple1", "simple2");

  await selectSource(dbg, "simple1");
  await selectSource(dbg, "simple2");
  closeTab(dbg, "simple1");
  closeTab(dbg, "simple2");

  // Test reloading the debugger
  dbg = await initDebugger("doc-scripts.html", "simple1", "simple2");
  expect(countTabs(dbg)).to.equal(0);
}
