
async function evalInConsoleAtPoint(dbg, fixture, { line, column }, statements) {
  const { selectors: { getBreakpoint, getBreakpoints }, getState } = dbg;

  const filename = `fixtures/${fixture}/input.js`;
  await waitForSources(dbg, filename);

  ok(true, "Original sources exist");
  const source = findSource(dbg, filename);

  await selectSource(dbg, source);

  // Test that breakpoint is not off by a line.
  await addBreakpoint(dbg, source, line);

  is(getBreakpoints(getState()).size, 1, "One breakpoint exists");
  ok(
    getBreakpoint(getState(), { sourceId: source.id, line, column }),
    "Breakpoint has correct line"
  );

  const fnName = fixture.replace(/-([a-z])/g, (s, c) => c.toUpperCase());

  const invokeResult = invokeInTab(fnName);

  let invokeFailed = await Promise.race([
    waitForPaused(dbg),
    invokeResult.then(() => new Promise(() => {}), () => true)
  ]);

  if (invokeFailed) {
    return invokeResult;
  }

  assertPausedLocation(dbg);

  await assertConsoleEval(dbg, statements);

  await removeBreakpoint(dbg, source.id, line, column);

  is(getBreakpoints(getState()).size, 0, "Breakpoint reverted");

  await resume(dbg);

  // If the invoke errored later somehow, capture here so the error is reported nicely.
  await invokeResult;

  ok(true, `Ran tests for ${fixture} at line ${line} column ${column}`);
}

async function assertConsoleEval(dbg, statements) {
  const jsterm = (await dbg.toolbox.selectTool("webconsole")).hud.jsterm;

  for (const [index, statement] of statements.entries()) {
    await dbg.client.evaluate(`
      window.TEST_RESULT = false;
    `);
    await jsterm.execute(`
      TEST_RESULT = ${statement};
    `);

    const result = await dbg.client.evaluate(`window.TEST_RESULT`);
    is(result.result, true, `'${statement}' evaluates to true`);
  }
}

add_task(async function() {
  await pushPref("devtools.debugger.features.map-scopes", true);

  const dbg = await initDebugger("doc-babel.html");

  await evalInConsoleAtPoint(dbg, "eval-source-maps", { line: 14, column: 4 }, [
    "one === 1",
    "two === 4",
    "three === 5",
  ]);

  await evalInConsoleAtPoint(dbg, "imported-bindings", { line: 20, column: 2 }, [
    `aDefault === "a-default"`,
    `anAliased === "an-original"`,
    `aNamed === "a-named"`,
    `aDefault2 === "a-default2"`,
    `anAliased2 === "an-original2"`,
    `aNamed2 === "a-named2"`,
    `aDefault3 === "a-default3"`,
    `anAliased3 === "an-original3"`,
    `aNamed3 === "a-named3"`,
  ]);

  await evalInConsoleAtPoint(dbg, "shadowed-vars", { line: 18, column: 6 }, [
    `aVar === "var3"`,
    `aLet === "let3"`,
    `aConst === "const3"`,
  ]);
});
