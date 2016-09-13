// @flow

import type { Record } from "./utils/makeRecord";
import type { SourcesState } from "./reducers/sources";

const URL = require("url");
const path = require("./utils/path");
const sources = require("./reducers/sources");
const pause = require("./reducers/pause");
const breakpoints = require("./reducers/breakpoints");

type AppState = {
  sources: Record<SourcesState>,
  breakpoints: any,
  tabs: any,
  pause: any
};

function getTabs(state: AppState) {
  return state.tabs.get("tabs");
}

function getSelectedTab(state: AppState) {
  return state.tabs.get("selectedTab");
}

function getSourceMapURL(state: AppState, source: any) {
  if (path.isURL(source.sourceMapURL)) {
    // If it's a full URL already, just use it.
    return source.sourceMapURL;
  } else if (path.isAbsolute(source.sourceMapURL)) {
    // If it's an absolute path, it should be resolved relative to the
    // host of the source.
    const urlObj: any = URL.parse(source.url);
    const base = urlObj.protocol + "//" + urlObj.host;
    return base + source.sourceMapURL;
  }
  // Otherwise, it's a relative path and should be resolved relative
  // to the source.
  return path.dirname(source.url) + "/" + source.sourceMapURL;
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
  getSelectedLocation: sources.getSelectedLocation,
  getPendingSelectedSourceURL: sources.getPendingSelectedSourceURL,
  getSourceMap: sources.getSourceMap,
  getPrettySource: sources.getPrettySource,

  getSourceMapURL,

  getBreakpoint: breakpoints.getBreakpoint,
  getBreakpoints: breakpoints.getBreakpoints,
  getBreakpointsForSource: breakpoints.getBreakpointsForSource,
  getBreakpointsDisabled: breakpoints.getBreakpointsDisabled,
  getBreakpointsLoading: breakpoints.getBreakpointsLoading,

  getTabs,
  getSelectedTab,

  getPause: pause.getPause,
  getLoadedObjects: pause.getLoadedObjects,
  getExpressions: pause.getExpressions,
  getIsWaitingOnBreak: pause.getIsWaitingOnBreak,
  getShouldPauseOnExceptions: pause.getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions: pause.getShouldIgnoreCaughtExceptions,
  getFrames: pause.getFrames,
  getSelectedFrame: pause.getSelectedFrame
};
