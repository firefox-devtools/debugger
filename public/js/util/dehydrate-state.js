
const I = require("immutable");
const { fromJS } = I;
const SourcesState = require("../reducers/sources").SourcesState;

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
    pause: fromJS(jsState.pause),
    tabs: fromJS(jsState.tabs)
  }
}

module.exports = dehydrate;
