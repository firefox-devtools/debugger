// @flow

import type { Record } from "./utils/makeRecord";
import type { SourcesState } from "./reducers/sources";
import type { Location } from "./actions/types";

const sources = require("./reducers/sources");
const breakpoints = require("./reducers/breakpoints");

type AppState = {
  sources: Record<SourcesState>,
  breakpoints: any,
  tabs: any,
  pause: any
};

const { isGenerated, getGeneratedSourceLocation, getOriginalSourceUrls,
        isOriginal, getOriginalSourcePosition, getGeneratedSourceId
      } = require("./utils/source-map");

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

function getShouldPauseOnExceptions(state: AppState) {
  return state.pause.get("shouldPauseOnExceptions");
}

function getFrames(state: AppState) {
  return state.pause.get("frames") || [];
}

function getSelectedFrame(state: AppState) {
  return state.pause.get("selectedFrame");
}

function getSourceMapURL(state: AppState, source: any) {
  const tab = getSelectedTab(state);
  return tab.get("url") + "/" + source.sourceMapURL;
}

function getGeneratedLocation(state: AppState, location: Location) {
  const source: any = sources.getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (isOriginal(source.toJS())) {
    return getGeneratedSourceLocation(source.toJS(), location);
  }

  return location;
}

function getOriginalLocation(state: AppState, location: Location) {
  const source: any = sources.getSource(state, location.sourceId);

  if (!source) {
    return location;
  }

  if (isGenerated(source.toJS())) {
    const { url, line } = getOriginalSourcePosition(
      source.toJS(),
      location
    );

    const originalSource: any = sources.getSourceByURL(state, url);
    return {
      sourceId: originalSource.get("id"),
      line
    };
  }

  return location;
}

function getGeneratedSource(state: AppState, source: any) {
  if (isGenerated(source)) {
    return source;
  }

  const generatedSourceId = getGeneratedSourceId(source);
  const originalSource = sources.getSource(state, generatedSourceId);

  if (originalSource) {
    return originalSource.toJS();
  }

  return source;
}

function getOriginalSources(state: AppState, source: any) {
  const originalSourceUrls = getOriginalSourceUrls(source);
  return originalSourceUrls.map(url => sources.getSourceByURL(state, url));
}

/**
 * @param object - location
 */

module.exports = {
  getSource: sources.getSource,
  getSourceByURL: sources.getSourceByURL,
  getSourceById: sources.getSourceById,
  getSources: sources.getSources,
  getSourceText: sources.getSourceText,
  getSourceTabs: sources.getSourceTabs,
  getSelectedSource: sources.getSelectedSource,
  getSourceMap: sources.getSourceMap,

  getOriginalLocation,
  getGeneratedLocation,
  getGeneratedSource,
  getOriginalSources,
  getSourceMapURL,

  getBreakpoint: breakpoints.getBreakpoint,
  getBreakpoints: breakpoints.getBreakpoints,
  getBreakpointsForSource: breakpoints.getBreakpointsForSource,

  getTabs,
  getSelectedTab,
  getPause,
  getLoadedObjects,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getFrames,
  getSelectedFrame
};
