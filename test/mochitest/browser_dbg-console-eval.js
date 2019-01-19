/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Tests that clicking the DOM node button in any ObjectInspect
// opens the Inspector panel

function waitForConsolePanelChange(dbg) {
  const { toolbox } = dbg;

  return new Promise(resolve => {
    toolbox.getPanelWhenReady("webconsole").then(() => {
      ok(toolbox.webconsolePanel, "Console is shown.");
      resolve(toolbox.webconsolePanel);
    });
  });
}

add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html", "simple2");

  await selectSource(dbg, "simple2", 1);

  clickElement(dbg, "codeMirrorCode");
  await waitForElementWithSelector(dbg, ".CodeMirror-code");

  // pressKey(dbg, "selectAll"); // This doesn't work properly
  getCM(dbg).setSelection({ line: 0, ch: 0 }, { line: 8, ch: 0 });

  rightClickElement(dbg, "codeMirrorCode");
  selectContextMenuItem(dbg, "#node-menu-evaluate-in-console");

  await waitForConsolePanelChange(dbg);
});
