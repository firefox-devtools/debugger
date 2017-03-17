const {
  initDebugger,
  waitForElement,
  findElement,
  findElementWithSelector,
  selectSource,
  pressKey,
} = require("../utils");

async function keyboardNavigation(ctx) {
  const { is, info } = ctx;

  const dbg = await initDebugger("doc-scripts.html");
  let doc = dbg.win.document;

  await selectSource(dbg, "simple2");

  await waitForElement(dbg, ".CodeMirror");
  const editor = findElementWithSelector(dbg, ".CodeMirror");
  const textarea = findElementWithSelector(dbg, "textarea");
  editor.focus();

  info("Enter code editor");
  pressKey(dbg, "Enter");
  is(textarea, doc.activeElement, "Editor is enabled");

  info("Exit code editor and focus on container");
  pressKey(dbg, "Escape");
  is(editor, doc.activeElement, "Focused on container");

  info("Enter code editor");
  pressKey(dbg, "Tab");
  is(textarea, doc.activeElement, "Editor is enabled");
}

module.exports = keyboardNavigation;
