// @flow

import type { Record } from "./util/makeRecord";
import type { SourcesState } from "./reducers/sources";
import type { Location } from "./actions/types";

type AppState = {
  sources: Record<SourcesState>,
  breakpoints: any,
  tabs: any,
  pause: any
}

const { isGenerated, getGeneratedSourceLocation, getOriginalSourceUrls,
        isOriginal, getOriginalSourcePosition, getGeneratedSourceId
      } = require("./util/source-map");

/* Selectors */
function getSources(state: AppState) {
  return state.sources.sources;
}

function getSourceTabs(state: AppState) {
  return state.sources.tabs;
}

function getSourcesText(state: AppState) {
  return state.sources.sourcesText;
}

function getSelectedSource(state: AppState) {
  return state.sources.selectedSource;
}

function getSourceMap(state: AppState, sourceId: string) {
  return state.sources.sourceMaps.get(sourceId);
}

function getBreakpoint(state: AppState, location: Location) {
  return state.breakpoints.getIn(["breakpoints", makeLocationId(location)]);
}

function getBreakpoints(state: AppState) {
  return state.breakpoints.get("breakpoints");
}

function getBreakpointsForSource(state: AppState, sourceId: string) {
  return state.breakpoints.get("breakpoints").filter(bp => {
    return bp.getIn(["location", "sourceId"]) === sourceId;
  });
}

function getTabs(state: AppState) {
  return state.tabs.get("tabs");
}

function getSelectedTab(state: AppState) {
  return state.tabs.get("selectedTab");
}

function getPause(state: AppState) {
  return state.pause.get("pause");
}

function getLoadedObjects(state: AppState) {
  return state.pause.get("loadedObjects");
}

function getIsWaitingOnBreak(state: AppState) {
  return state.pause.get("isWaitingOnBreak");
}

function getFrames(state: AppState) {
  return state.pause.get("frames") || [];
}

function getSelectedFrame(state: AppState) {
  return state.pause.get("selectedFrame");
}

function getSource(state: AppState, id: string) {
  return getSources(state).get(id);
}

function getSourceCount(state: AppState) {
  return getSources(state).size;
}

function getSourceByURL(state: AppState, url: string) {
  return getSources(state).find(source => source.get("url") == url);
}

function getSourceById(state: AppState, id: string) {
  return getSources(state).find(source => source.get("id") == id);
}

function getSourceText(state: AppState, id: string) {
  return getSourcesText(state).get(id);
}

function getSourceMapURL(state: AppState, source: any) {
  const tab = getSelectedTab(state);
  return tab.get("url") + "/" + source.sourceMapURL;
}

function getGeneratedLocation(state: AppState, location: Location) {
  const source: any = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (isOriginal(source.toJS())) {
    return getGeneratedSourceLocation(source.toJS(), location);
  }

  return location;
}

function getOriginalLocation(state: AppState, location: Location) {
  const source: any = getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (isGenerated(source.toJS())) {
    const { url, line } = getOriginalSourcePosition(
      source.toJS(),
      location
    );

    const originalSource: any = getSourceByURL(state, url);
    return {
      sourceId: originalSource.get("id"),
      line
    };
  }

  return location;
}

function getGeneratedSource(state: AppState, source: any) {
  if (isGenerated(source.toJS())) {
    return source;
  }

  const generatedSourceId = getGeneratedSourceId(source.toJS());
  return getSource(state, generatedSourceId);
}

function getOriginalSources(state: AppState, source: any) {
  const originalSourceUrls = getOriginalSourceUrls(source.toJS());
  return originalSourceUrls.map(url => getSourceByURL(state, url));
}

/**
 * @param object - location
 */
function makeLocationId(location: Location) {
  return location.sourceId + ":" + location.line.toString();
}

module.exports = {
  getSource,
  getSources,
  getSourceMap,
  getSourceTabs,
  getSourceCount,
  getSourceByURL,
  getSourceById,
  getSourceMapURL,
  getSelectedSource,
  getSourceText,
  getOriginalLocation,
  getGeneratedLocation,
  getGeneratedSource,
  getOriginalSources,
  getBreakpoint,
  getBreakpoints,
  getBreakpointsForSource,
  getTabs,
  getSelectedTab,
  getPause,
  getLoadedObjects,
  getIsWaitingOnBreak,
  getFrames,
  getSelectedFrame,
  makeLocationId
};
