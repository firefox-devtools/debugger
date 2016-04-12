"use strict";

function toJS(val) {
  return val ? val.toJS() : null;
}

function getSource(state, actor) {
  return toJS(state.sources.getIn(["sources", actor]));
}

function getSources(state) {
  return state.sources.get("sources");
}

function getSourceCount(state) {
  return state.sources.get("sources").size;
}

function getSourceByURL(state, url) {
  return toJS(state.sources.get("sources").find(source => {
    return source.url == url;
  }));
}

function getSourceByActor(state, actor) {
  return toJS(state.sources.get("sources").find(source => {
    return source.actor == actor;
  }));
}

function getSelectedSource(state) {
  return toJS(
    state.sources.get("sources").get(state.sources.get("selectedSource"))
  );
}

function getSelectedSourceOpts(state) {
  return state.sources.get("selectedSourceOpts");
}

function getSourceText(state, actor) {
  return toJS(state.sources.getIn(["sourcesText", actor]));
}

function getBreakpoints(state) {
  return state.breakpoints.get("breakpoints").valueSeq().toList();
}

function getBreakpoint(state, location) {
  return state.breakpoints.getIn(["breakpoints", makeLocationId(location)]);
}

function getTabs(state) {
  return state.tabs.get("tabs");
}

function getSelectedTab(state) {
  return state.tabs.get("selectedTab");
}

function makeLocationId(location) {
  return location.actor + ":" + location.line.toString();
}

module.exports = {
  getSource,
  getSources,
  getSourceCount,
  getSourceByURL,
  getSourceByActor,
  getSelectedSource,
  getSelectedSourceOpts,
  getSourceText,
  getBreakpoint,
  getBreakpoints,
  getTabs,
  getSelectedTab,
  makeLocationId
};
