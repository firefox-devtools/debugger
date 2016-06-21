"use strict";

/* Selectors */
function getSources(state) {
  return state.sources.get("sources");
}

function getSourceTabs(state) {
  return state.sources.get("tabs");
}

function getSourcesText(state) {
  return state.sources.get("sourcesText");
}

function getSelectedSource(state) {
  return state.sources.get("selectedSource");
}

function getSelectedSourceOpts(state) {
  return state.sources.get("selectedSourceOpts");
}

function getBreakpoint(state, location) {
  return state.breakpoints.getIn(["breakpoints", makeLocationId(location)]);
}

function getBreakpoints(state) {
  return state.breakpoints.get("breakpoints");
}

function getBreakpointsForSource(state, sourceId) {
  return state.breakpoints.get("breakpoints").filter(bp => {
    return bp.getIn(["location", "sourceId"]) === sourceId;
  });
}

function getTabs(state) {
  return state.tabs.get("tabs");
}

function getSelectedTab(state) {
  return state.tabs.get("selectedTab");
}

function getPause(state) {
  return state.pause.get("pause");
}

function getLoadedObjects(state) {
  return state.pause.get("loadedObjects");
}

function getIsWaitingOnBreak(state) {
  return state.pause.get("isWaitingOnBreak");
}

function getFrames(state) {
  return state.pause.get("frames") || [];
}

function getSelectedFrame(state) {
  return state.pause.get("selectedFrame");
}

function getSource(state, id) {
  return getSources(state).get(id);
}

function getSourceCount(state) {
  return getSources(state).size;
}

function getSourceByURL(state, url) {
  return getSources(state).find(source => source.get("url") == url);
}

function getSourceById(state, id) {
  return getSources(state).find(source => source.get("id") == id);
}

function getSourceText(state, id) {
  return getSourcesText(state).get(id);
}

/**
 * @param object - location
 */
function makeLocationId(location) {
  return location.sourceId + ":" + location.line.toString();
}

module.exports = {
  getSource,
  getSources,
  getSourceTabs,
  getSourceCount,
  getSourceByURL,
  getSourceById,
  getSelectedSource,
  getSelectedSourceOpts,
  getSourceText,
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
