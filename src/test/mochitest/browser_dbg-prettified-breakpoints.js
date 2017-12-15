function findBreakpoint(dbg, url, line) {
  const { selectors: { getBreakpoint }, getState } = dbg;
  const source = findSource(dbg, url);
  return getBreakpoint(getState(), { sourceId: source.id, line });
}

add_task(async function() {
  const dbg = await initDebugger("doc-prettified-breakpoints.html");

  await selectSource(dbg, "click");

  await waitForSource(dbg, "click");
  const src = findSource(dbg, "click");

  await dbg.actions.togglePrettyPrint(src.id);

  const ppSrcUrl = `${src.url}:formatted`;
  await waitForSelectedSource(dbg, ppSrcUrl);
  const ppSrc = findSource(dbg, ppSrcUrl);

  await addBreakpoint(dbg, ppSrc, 6);

  let bp = findBreakpoint(dbg, ppSrcUrl, 6);
  is(bp.disabled, false, "breakpoint is enabled");

  invokeInTab("clickBody");

  await waitForPaused(dbg);

  assertPausedLocation(dbg);

  await resume(dbg);
});
