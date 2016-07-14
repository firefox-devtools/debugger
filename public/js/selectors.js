// @flow

import type { Record } from "./util/makeRecord";
import type { SourcesState } from "./reducers/sources";
import type { Location, Source } from "./actions/types";
const fromJS = require("./util/fromJS");

const { isGenerated, getOriginalSourcePosition
      } = require("./util/source-map");

type AppState = {
  sources: Record<SourcesState>,
  breakpoints: any,
  tabs: any,
  pause: any
}

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
  return state.breakpoints.get("breakpoints")
    .map(bp => bp.set(
      "location",
      getOriginalLocation(state, bp.get("location"))
    ));
}

function getBreakpointsForSource(state: AppState, sourceId: string) {
  return getBreakpoints(state)
    .filter(bp => bp.getIn(["location", "sourceId"]) === sourceId);
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

function getSourceMapURL(state: AppState, source: Source) {
  const tab = getSelectedTab(state);
  return tab.get("url") + "/" + source.sourceMapURL;
}

/**
 * @param object - location
 */
function makeLocationId(location: Location) {
  return location.sourceId + ":" + location.line.toString();
}

function getOriginalLocation(state: AppState, location) {
  const source = getSource(state, location.get("sourceId"));
  if (isGenerated(source.toJS())) {
    const { url, line } = getOriginalSourcePosition(
      source.toJS(),
      location.toJS()
    );

    const originalSource = getSourceByURL(state, url);
    return fromJS({
      sourceId: originalSource.get("id"),
      line
    });
  }

  return location;
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
