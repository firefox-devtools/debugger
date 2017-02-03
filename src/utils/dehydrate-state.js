//@flow

const I = require("immutable");
const { fromJS } = I;
const SourcesState: any = require("../reducers/sources").State;
const BreakpointsState = require("../reducers/breakpoints").State;

function dehydrate(jsState: Object) {
  return {
    sources: SourcesState({
      sources: fromJS(jsState.sources.sources),
      selectedSource: fromJS(jsState.sources.selectedSource),
      sourcesText: fromJS(jsState.sources.sourcesText),
      tabs: fromJS(jsState.sources.tabs)
    }),
    breakpoints: jsState.breakpoints ? BreakpointsState({
      breakpoints: I.Map(jsState.breakpoints.breakpoints)
    }) : null,
    eventListeners: fromJS(jsState.eventListeners),
    pause: jsState.pause ? I.Map({
      pause: fromJS(jsState.pause.pause),
      loadedObjects: fromJS(jsState.pause.loadedObjects),
      frames: jsState.pause.frames,
      selectedFrameId: jsState.pause.selectedFrameId
    }) : null,
    tabs: fromJS(jsState.tabs)
  };
}

module.exports = dehydrate;
