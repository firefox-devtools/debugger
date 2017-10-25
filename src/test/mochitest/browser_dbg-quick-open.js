/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function assertEnabled(dbg) {
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    true,
    "quickOpen enabled"
  );
}

function assertDisabled(dbg) {
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    false,
    "quickOpen disabled"
  );
}

function assertLine(dbg, lineNumber) {
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).line,
    lineNumber,
    `goto line is ${lineNumber}`
  );
}

function assertColumn(dbg, columnNumber) {
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).column,
    columnNumber,
    `goto column is ${columnNumber}`
  );
}

async function waitToClose(dbg) {
  pressKey(dbg, "Escape");
  return new Promise(r => setTimeout(r, 200));
}

function resultCount(dbg) {
  return findAllElements(dbg, "resultItems").length;
}

function quickOpen(dbg, query, shortcut = "quickOpen") {
  pressKey(dbg, shortcut);
  assertEnabled(dbg);
  type(dbg, query);
}

// Testing quick open
add_task(async function() {
  const dbg = await initDebugger("doc-script-switching.html");

  info('test opening and closing');
  quickOpen(dbg, "");
  pressKey(dbg, "Escape");
  assertDisabled(dbg);

  quickOpen(dbg, "sw");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  let source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-01/), "first source is selected");

  info('Arrow keys and check to see if source is selected');
  quickOpen(dbg, "sw");
  is(resultCount(dbg), 2);
  pressKey(dbg, "Down");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-02/), "second source is selected");
  quickOpen(dbg, "sw");
  pressKey(dbg, "Tab");
  assertDisabled(dbg);

  info('Testing function search');
  await selectSource(dbg, "switching-01");
  quickOpen(dbg, "", "quickOpenFunc");
  pressKey(dbg, "Escape");
  assertDisabled(dbg);

  quickOpen(dbg, "", "quickOpenFunc");
  is(resultCount(dbg), 1);

  type(dbg, "x");
  is(resultCount(dbg), 0);
  pressKey(dbg, "Escape");
  assertDisabled(dbg);

  info('Testing variable search');
  quickOpen(dbg, "sw2");
  pressKey(dbg, "Enter");
  await selectSource(dbg, "switching-02");
  quickOpen(dbg, "#");
  is(resultCount(dbg), 1);
  const results = findAllElements(dbg, "resultItems");
  results.forEach(result => is(result.textContent, "x:13"));
  await waitToClose(dbg);

  info('Testing goto line:column');
  assertLine(dbg, undefined);
  assertColumn(dbg, undefined);
  quickOpen(dbg, ":7:12");
  pressKey(dbg, "Enter");
  assertLine(dbg, 7);
  assertColumn(dbg, 12);

  info('Testing gotoSource');
  quickOpen(dbg, "sw1:5");
  pressKey(dbg, "Enter");
  source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-01/), "first source is selected");
  assertLine(dbg, 5);
});
