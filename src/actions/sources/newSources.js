// @flow

// If a request has been made to show this source, go ahead and
// select it.
async function checkSelectedSource(state: State, dispatch, source) {
  const pendingLocation = getPendingSelectedLocation(state);

  if (pendingLocation && !!source.url && pendingLocation.url === source.url) {
    await dispatch(selectSource(source.id, { location: pendingLocation }));
  }
}

async function checkPendingBreakpoints(state, dispatch, sourceId) {
  // source may have been modified by selectSource
  const source = getSource(state, sourceId).toJS();
  const pendingBreakpoints = getPendingBreakpointsForSource(state, source.url);
  if (!pendingBreakpoints.size) {
    return;
  }

  // load the source text if there is a pending breakpoint for it
  await dispatch(loadSourceText(source));

  if (isOriginalId(source.id)) {
    const generatedSource = getGeneratedSource(state, source);
    await dispatch(loadSourceText(source.toJS()));
  }

  const pendingBreakpointsArray = pendingBreakpoints.valueSeq().toJS();
  for (const pendingBreakpoint of pendingBreakpointsArray) {
    await dispatch(syncBreakpoint(sourceId, pendingBreakpoint));
  }
}

async function loadSourceMap(generatedSource: Source, sourceMaps): Source[] {
  const urls: Array<any> = await sourceMaps.getOriginalURLs(generatedSource);

  return urls.map(
    originalUrl =>
      ({
        url: originalUrl,
        id: sourceMaps.generatedToOriginalId(generatedSource.id, originalUrl),
        isPrettyPrinted: false,
        isWasm: false,
        isBlackBoxed: false,
        loadedState: "unloaded"
      }: Source)
  );
}

async function loadOriginalSources(sources: Source[], sourceMaps) {
  let originalSources = [];

  for (const source of sources) {
    originalSources = [
      ...originalSources,
      ...(await loadSourceMap(source, sourceMaps))
    ];
  }
}

// adds all of the new sources
// 3.

export function newSources(sources: Source[]) {
  return async ({ dispatch, getState, sourceMaps }: ThunkArgs) => {
    const filteredSources = sources.filter(
      source => !getSource(getState(), source.id)
    );

    // 1. add sources to the redux store
    dispatch({ type: "ADD_SOURCES", sources });

    // 2. check for a selected source and start loading it
    for (const source of filteredSources) {
      checkSelectedSource(getState(), dispatch, source);
    }

    // 3. loads all of the original sources and adds them to the store
    const originalSources = await loadOriginalSources(
      filteredSources,
      sourceMaps
    );

    dispatch({ type: "ADD_SOURCES", sources });

    // 4. check for a selected source and start loading it
    for (const source of originalSources) {
      checkSelectedSource(getState(), dispatch, source);
    }

    // 5. check for pending breakpoints and syncs them.
    // NOTE: it would be nice to make this smarter so that
    // we first show un-adjusted breakpoints and then we adjust the locations.
    const allSources = filteredSources.concat(originalSources);
    for (const source of allSources) {
      checkPendingBreakpoints(getState(), dispatch, source.id);
    }
  };
}
