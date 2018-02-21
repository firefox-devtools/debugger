/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Tests for stepping through Babel's compile output.

async function breakpointSteps(dbg, fixture, { line, column }, steps) {
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

  await removeBreakpoint(dbg, source.id, line, column);

  is(getBreakpoints(getState()).size, 0, "Breakpoint reverted");

  await runSteps(dbg, source, steps);

  await resume(dbg);

  // If the invoke errored later somehow, capture here so the error is
  // reported nicely.
  await invokeResult;

  ok(true, `Ran tests for ${fixture} at line ${line} column ${column}`);
}

async function runSteps(dbg, source, steps) {
  const { selectors: { getVisibleSelectedFrame }, getState } = dbg;

  for (const [i, [type, position]] of steps.entries()) {
    switch (type) {
      case "stepOver":
        await stepOver(dbg);
        break;
      case "stepIn":
        await stepIn(dbg);
        break;
      default:
        throw new Error("Unknown stepping type");
    }

    const { location } = getVisibleSelectedFrame(getState());

    is(location.sourceId, source.id, `Step ${i} has correct sourceId`);
    is(location.line, position.line, `Step ${i} has correct line`);
    is(location.column, position.column, `Step ${i} has correct column`);

    assertPausedLocation(dbg);
  }
}

add_task(async function() {
  requestLongerTimeout(2);

  const dbg = await initDebugger("doc-babel.html");

  await breakpointSteps(dbg, "step-over-for-of", { line: 4, column: 2 }, [
    ["stepOver", { line: 6, column: 2 }],
    ["stepOver", { line: 7, column: 4 }],
    ["stepOver", { line: 6, column: 2 }],
    ["stepOver", { line: 7, column: 4 }],
    ["stepOver", { line: 6, column: 2 }],
    ["stepOver", { line: 10, column: 2 }]
  ]);

  // This codifies the current behavior, but stepping twice over the for
  // header isn't ideal.
  await breakpointSteps(dbg, "step-over-for-of-array", { line: 3, column: 2 }, [
    ["stepOver", { line: 5, column: 2 }],
    ["stepOver", { line: 5, column: 7 }],
    ["stepOver", { line: 6, column: 4 }],
    ["stepOver", { line: 5, column: 2 }],
    ["stepOver", { line: 5, column: 7 }],
    ["stepOver", { line: 6, column: 4 }],
    ["stepOver", { line: 5, column: 2 }],
    ["stepOver", { line: 9, column: 2 }]
  ]);

  // The closure means it isn't actually possible to step into the for body,
  // and Babel doesn't map the _loop() call, so we step past it automatically.
  await breakpointSteps(
    dbg,
    "step-over-for-of-closure",
    { line: 6, column: 2 },
    [
      ["stepOver", { line: 8, column: 2 }],
      ["stepOver", { line: 12, column: 2 }]
    ]
  );

  // Same as the previous, not possible to step into the body. The less
  // complicated array logic makes it possible to step into the header at least,
  // but this does end up double-visiting the for head.
  await breakpointSteps(
    dbg,
    "step-over-for-of-array-closure",
    { line: 3, column: 2 },
    [
      ["stepOver", { line: 5, column: 2 }],
      ["stepOver", { line: 5, column: 7 }],
      ["stepOver", { line: 5, column: 2 }],
      ["stepOver", { line: 5, column: 7 }],
      ["stepOver", { line: 5, column: 2 }],
      ["stepOver", { line: 9, column: 2 }]
    ]
  );

  await breakpointSteps(
    dbg,
    "step-over-function-params",
    { line: 6, column: 2 },
    [["stepOver", { line: 7, column: 2 }], ["stepIn", { line: 2, column: 2 }]]
  );

  await breakpointSteps(
    dbg,
    "step-over-regenerator-await",
    { line: 2, column: 2 },
    [
      // Won't work until a fix to regenerator lands and we rebuild.
      // https://github.com/facebook/regenerator/issues/342
      // ["stepOver", { line: 4, column: 2 }],
    ]
  );
});
