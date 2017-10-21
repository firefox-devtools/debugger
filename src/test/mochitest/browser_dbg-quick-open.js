/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

async function waitToClose(dbg) {
  pressKey(dbg, "Escape");
  return new Promise(r => setTimeout(r, 200));
}

function resultCount(dbg) {
  return findAllElements(dbg, "resultItems").length;
}

// Testing quick open
add_task(async function() {
  const dbg = await initDebugger("doc-script-switching.html");

  // test opening and closing
  pressKey(dbg, "quickOpen");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    true,
    "quickOpen enabled"
  );
  pressKey(dbg, "Escape");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    false,
    "quickOpen disabled"
  );

  pressKey(dbg, "quickOpen");
  await waitForElement(dbg, "input");
  type(dbg, "sw");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  let source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-01/), "first source is selected");

  // 2. arrow keys and check to see if source is selected
  pressKey(dbg, "quickOpen");
  type(dbg, "sw");
  is(resultCount(dbg), 2);
  pressKey(dbg, "Down");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-02/), "second source is selected");
  pressKey(dbg, "quickOpen");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    true,
    "quickOpen enabled"
  );
  type(dbg, "sw");
  pressKey(dbg, "Tab");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    false,
    "quickOpen disabled"
  );

  // Testing function search
  await selectSource(dbg, "switching-01");
  pressKey(dbg, "quickOpenFunc");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    true,
    "quickOpen enabled"
  );
  pressKey(dbg, "Escape");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    false,
    "quickOpen disabled"
  );

  pressKey(dbg, "quickOpenFunc");
  is(resultCount(dbg), 1);

  type(dbg, "x");
  is(resultCount(dbg), 0);
  pressKey(dbg, "Escape");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    false,
    "quickOpen disabled"
  );

  // Testing variable search
  pressKey(dbg, "quickOpen");
  type(dbg, "sw2");
  pressKey(dbg, "Enter");
  await selectSource(dbg, "switching-02");
  pressKey(dbg, "quickOpen");
  type(dbg, "#");
  is(resultCount(dbg), 1);
  const results = findAllElements(dbg, "resultItems");
  results.forEach(result => is(result.textContent, "x:13"));
  await waitToClose(dbg);

  // Testing goto line:column
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).line,
    undefined,
    "goto line is undefined"
  );
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).column,
    undefined,
    "goto column is undefined"
  );
  pressKey(dbg, "quickOpen");
  type(dbg, ":7:12");
  pressKey(dbg, "Enter");
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).line,
    7,
    "goto line is 7"
  );
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).column,
    12,
    "goto column is 12"
  );

  // Testing gotoSource
  pressKey(dbg, "quickOpen");
  is(
    dbg.selectors.getQuickOpenEnabled(dbg.getState()),
    true,
    "quickOpen enabled"
  );
  type(dbg, "sw1:5");
  pressKey(dbg, "Enter");
  source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-01/), "first source is selected");
  is(
    dbg.selectors.getSelectedLocation(dbg.getState()).line,
    5,
    "goto line is 5"
  );
});
