// @flow

import type { Record } from "./utils/makeRecord";
import type { SourcesState } from "./reducers/sources";

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
  getIsWaitingOnBreak,
  getShouldPauseOnExceptions,
  getFrames,
  getSelectedFrame
};
