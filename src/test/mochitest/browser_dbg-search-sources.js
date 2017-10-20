/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Testing source search
add_task(async function() {
  const dbg = await initDebugger("doc-script-switching.html");

  // test opening and closing
  pressKey(dbg, "sourceSearch");
  is(
    dbg.selectors.getActiveSearch(dbg.getState()),
    "source",
    "source search enabled"
  );
  pressKey(dbg, "Escape");
  is(
    dbg.selectors.getActiveSearch(dbg.getState()),
    null,
    "source search disabled"
  );

  pressKey(dbg, "sourceSearch");
  await waitForElement(dbg, "input");
  type(dbg, "sw");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  let source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-01/), "first source is selected");

  // 2. arrow keys and check to see if source is selected
  pressKey(dbg, "sourceSearch");
  type(dbg, "sw");
  pressKey(dbg, "Down");
  pressKey(dbg, "Enter");

  await waitForDispatch(dbg, "LOAD_SOURCE_TEXT");
  source = dbg.selectors.getSelectedSource(dbg.getState());
  ok(source.get("url").match(/switching-02/), "second source is selected");
  pressKey(dbg, "sourceSearch");
  is(
    dbg.selectors.getActiveSearch(dbg.getState()),
    "source",
    "source search enabled"
  );
  type(dbg, "sw");
  pressKey(dbg, "Tab");
  is(
    dbg.selectors.getActiveSearch(dbg.getState()),
    null,
    "source search disabled"
  );
});
