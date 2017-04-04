const {
  initDebugger,
  waitForPaused,
  pressKey,
  findElementWithSelector,
  type,
  waitForElement,
  invokeInTab,
  clickElement,
  findElement,
  waitForDispatch
} = require("../utils");

// Testing source search
module.exports = async function(ctx) {
  const { ok, is, info } = ctx;
  const dbg = await initDebugger("doc-script-switching.html");

  pressKey(dbg, "sourceSearch");
  await waitForElement(dbg, "input");
  findElementWithSelector(dbg, "input").focus();
  type(dbg, "sw");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  let source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-01/), "first source is selected");

  // 2. arrow keys and check to see if source is selected
  pressKey(dbg, "sourceSearch");
  findElementWithSelector(dbg, "input").focus();
  type(dbg, "sw");
  pressKey(dbg, "Down");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-02/), "second source is selected");
};
