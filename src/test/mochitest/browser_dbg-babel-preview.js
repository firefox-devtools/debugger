/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

function getCoordsFromPosition(cm, { line, ch }) {
  return cm.charCoords({ line: ~~line, ch: ~~ch });
}

async function assertPreviews(dbg, previews) {
  for (const { line, column, expression, result, fields } of previews) {
    hoverAtPos(dbg, { line, ch: column });

    if (fields && result) {
      throw new Error("Invalid test fixture");
    }

    if (fields) {
      for (const [field, value] of fields) {
        await assertPreviewPopup(dbg, { expression, field, value });
      }
    } else {
      await assertPreviewTextValue(dbg, { expression, text: result });
    }

    // Move to column 0 after to make sure that the preview created by this
    // test does not affect later attempts to hover and preview.
    hoverAtPos(dbg, { line: line - 1, ch: 0 });
  }
}

async function breakpointPreviews(dbg, fixture, { line, column }, previews) {
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

  await assertPreviews(dbg, previews);

  await removeBreakpoint(dbg, source.id, line, column);

  is(getBreakpoints(getState()).size, 0, "Breakpoint reverted");

  await resume(dbg);

  // If the invoke errored later somehow, capture here so the error is reported nicely.
  await invokeResult;

  ok(true, `Ran tests for ${fixture} at line ${line} column ${column}`);
}

add_task(async function() {
  await pushPref("devtools.debugger.features.map-scopes", true);

  const dbg = await initDebugger("doc-babel.html");

  await breakpointPreviews(dbg, "for-of", { line: 5, column: 4 }, [
    {
      line: 5,
      column: 7,
      expression: "doThing",
      result: "doThing(arg)",
    },
    {
      line: 5,
      column: 12,
      expression: "x",
      result: "1",
    },
    {
      line: 8,
      column: 16,
      expression: "doThing",
      result: "doThing(arg)",
    },
  ]);

  await breakpointPreviews(dbg, "shadowed-vars", { line: 18, column: 6 }, [
    // These aren't what the user would expect, but we test them anyway since
    // they reflect what this actually returns. These shadowed bindings read
    // the binding closest to the current frame's scope even though their
    // actual value is different.
    {
      line: 2,
      column: 9,
      expression: "aVar",
      result: '"var3"',
    },
    {
      line: 3,
      column: 9,
      expression: "_aLet2;",
      result: '"let3"',
    },
    {
      line: 4,
      column: 11,
      expression: "_aConst2;",
      result: '"const3"',
    },
    {
      line: 10,
      column: 11,
      expression: "aVar",
      result: '"var3"',
    },
    {
      line: 11,
      column: 11,
      expression: "_aLet2;",
      result: '"let3"',
    },
    {
      line: 12,
      column: 13,
      expression: "_aConst2;",
      result: '"const3"',
    },

    // These actually result in the values the user would expect.
    {
      line: 14,
      column: 13,
      expression: "aVar",
      result: '"var3"',
    },
    {
      line: 15,
      column: 13,
      expression: "_aLet2;",
      result: '"let3"',
    },
    {
      line: 16,
      column: 13,
      expression: "_aConst2;",
      result: '"const3"',
    },
  ]);

  await breakpointPreviews(dbg, "imported-bindings", { line: 20, column: 2 }, [
    {
      line: 22,
      column: 16,
      expression: "_mod2.default;",
      result: '"a-default"',
    },
    {
      line: 23,
      column: 16,
      expression: "_mod4.original;",
      result: '"an-original"',
    },
    {
      line: 24,
      column: 16,
      expression: "_mod3.aNamed;",
      result: '"a-named"',
    },
    {
      line: 25,
      column: 16,
      expression: "_mod4.original;",
      result: '"an-original"',
    },
    {
      line: 26,
      column: 16,
      expression: "aNamespace",
      fields: [
        ['aNamed', 'a-named'],
        ['default', 'a-default'],
      ],
    },
    {
      line: 31,
      column: 20,
      expression: "_mod7.default;",
      result: '"a-default2"',
    },
    {
      line: 32,
      column: 20,
      expression: "_mod9.original;",
      result: '"an-original2"',
    },
    {
      line: 33,
      column: 20,
      expression: "_mod8.aNamed2;",
      result: '"a-named2"',
    },
    {
      line: 34,
      column: 20,
      expression: "_mod9.original;",
      result: '"an-original2"',
    },
    {
      line: 35,
      column: 20,
      expression: "aNamespace2",
      fields: [
        ['aNamed', 'a-named2'],
        ['default', 'a-default2'],
      ],
    },
  ]);
});
