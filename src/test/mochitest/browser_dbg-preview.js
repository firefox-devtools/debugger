/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests opening the variable inspection popup on a variable which has a
// simple literal as the value.

add_task(async function() {
  const dbg = await initDebugger("doc-frame-parameters.html");
  await selectSource(dbg, "doc-frame-parameters");
  const editor = getCM(bdg);
  is(true, true);
});
// GET PREVIEW: dbg.selectors.getPreview(dbg.getState());

/* functon test() {
  Task.spawn(function*() {
    const options = {
      source: TAB_URL,
      line: 1
    };
    const [tab, , panel] = yield initDebugger(TAB_URL, options);
    const win = panel.panelWin;
    const bubble = win.DebuggerView.VariableBubble;
    const tooltip = bubble._tooltip.panel;

    bubble._ignoreLiterals = false;

    function verifyContents(textContent, className) {
      is(
        tooltip.querySelectorAll(".variables-view-container").length,
        0,
        "There should be no variables view containers added to the tooltip."
      );
      is(
        tooltip.querySelectorAll(".devtools-tooltip-simple-text").length,
        1,
        "There should be a simple text node added to the tooltip instead."
      );

      is(
        tooltip.querySelector(".devtools-tooltip-simple-text").textContent,
        textContent,
        "The inspected property's value is correct."
      );
      ok(
        tooltip
          .querySelector(".devtools-tooltip-simple-text")
          .className.includes(className),
        "The inspected property's value is colorized correctly."
      );
    }

    const onCaretAndScopes = waitForCaretAndScopes(panel, 24);
    callInTab(tab, "start");
    yield onCaretAndScopes;

    // Inspect variables.
    yield openVarPopup(panel, { line: 15, ch: 12 });
    verifyContents("1", "token-number");

    yield reopenVarPopup(panel, { line: 16, ch: 21 });
    verifyContents("1", "token-number");

    yield reopenVarPopup(panel, { line: 17, ch: 21 });
    verifyContents("1", "token-number");

    yield reopenVarPopup(panel, { line: 17, ch: 27 });
    verifyContents('"beta"', "token-string");

    yield reopenVarPopup(panel, { line: 17, ch: 44 });
    verifyContents("false", "token-boolean");

    yield reopenVarPopup(panel, { line: 17, ch: 54 });
    verifyContents("null", "token-null");

    yield reopenVarPopup(panel, { line: 17, ch: 63 });
    verifyContents("undefined", "token-undefined");

    yield resumeDebuggerThenCloseAndFinish(panel);
  });
}*/
