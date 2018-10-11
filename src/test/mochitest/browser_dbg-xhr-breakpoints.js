add_task(async function() {
    const dbg = await initDebugger("doc-xhr.html");
    await waitForSources(dbg, "fetch.js");
    await dbg.actions.setXHRBreakpoint("doc", "GET");
    debugger;
    invokeInTab("main");
    await waitForPaused(dbg);
    assertPausedLocation(dbg);
    resume(dbg);

    await dbg.actions.removeXHRBreakpoint(0);
    await invokeInTab("main");
    assertNotPaused(dbg);

    await dbg.actions.setXHRBreakpoint("doc", "POST");
    await invokeInTab("main");
    assertNotPaused(dbg);
});

