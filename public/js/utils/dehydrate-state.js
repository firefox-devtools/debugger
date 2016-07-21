const I = require("immutable");
const { fromJS } = I;
const SourcesState = require("../reducers/sources").State;

function dehydrate(jsState) {
  return {
    sources: SourcesState({
      sources: fromJS(jsState.sources.sources),
      selectedSource: fromJS(jsState.sources.selectedSource),
      sourcesText: fromJS(jsState.sources.sourcesText),
      tabs: fromJS(jsState.sources.tabs)
    }),
    breakpoints: fromJS(jsState.breakpoints),
    eventListeners: fromJS(jsState.eventListeners),
    pause: jsState.pause ? I.Map({
      pause: fromJS(jsState.pause.pause),
      loadedObjects: fromJS(jsState.pause.loadedObjects),
      frames: jsState.pause.frames
    }) : null,
    tabs: fromJS(jsState.tabs)
  };
}

module.exports = dehydrate;
