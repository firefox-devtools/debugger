// @flow

import type { Record } from "./utils/makeRecord";
import type { SourcesState } from "./reducers/sources";

const URL = require("url");
const path = require("./utils/path");
const sources = require("./reducers/sources");
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

function getPause(state: AppState) {
  return state.pause.get("pause");
}

function getLoadedObjects(state: AppState) {
  return state.pause.get("loadedObjects");
}

function getExpressions(state: AppState) {
  return state.pause.get("expressions");
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
  getSourceMap: sources.getSourceMap,

  getSourceMapURL,

  getBreakpoint: breakpoints.getBreakpoint,
  getBreakpoints: breakpoints.getBreakpoints,
  getBreakpointsForSource: breakpoints.getBreakpointsForSource,

  getTabs,
  getSelectedTab,
  getPause,
  getLoadedObjects,
  getExpressions,
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getFrames,
  getSelectedFrame
};
