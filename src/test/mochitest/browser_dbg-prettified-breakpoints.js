add_task(async function() {
  const dbg = await initDebugger("doc-prettified-breakpoints.html");

  await selectSource(dbg, "simple4.js");

  clickElement(dbg, "prettyPrintButton");

  await waitForSource(dbg, "simple4.js:formatted");
  const ppSrc = findSource(dbg, "simple4.js:formatted");

  await addBreakpoint(dbg, ppSrc, 2);

  invokeInTab("F");

  for (let step = 0; step < 16; step++) {
    await stepIn(dbg);
    assertPausedLocation(dbg);
  }

  dbg.actions.stepIn();
  assertNotPaused(dbg);
});
