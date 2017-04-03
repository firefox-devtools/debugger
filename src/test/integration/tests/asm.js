const {
  initDebugger,
  invokeInTab,
  assertPausedLocation,
  clickElement,
  findAllElements,
  addBreakpoint,
  reload,
  waitForPaused,
  resume,
  selectSource,
  waitForSources
} = require("../utils");

async function asm(ctx) {
  const { is } = ctx;
  const dbg = await initDebugger("doc-asm.html");

  const { selectors: { getSelectedSource }, getState } = dbg;

  await reload(dbg);

  // After reload() we are getting getSources notifiction for old sources,
  // using the debugger statement to really stop are reloaded page.
  await waitForPaused(dbg);
  await resume(dbg);

  await waitForSources(dbg, "doc-asm.html", "asm.js");

  // Expand nodes and make sure more sources appear.
  is(findAllElements(dbg, "sourceNodes").length, 2);

  clickElement(dbg, "sourceArrow", 2);
  is(findAllElements(dbg, "sourceNodes").length, 4);

  selectSource(dbg, "asm.js");

  await addBreakpoint(dbg, "asm.js", 7);
  invokeInTab(dbg, "runAsm");

  await waitForPaused(dbg);
  assertPausedLocation(dbg, ctx, "asm.js", 7);
}

module.exports = asm;
