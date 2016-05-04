"use strict";

const { createSelector } = require("reselect");

/* Selectors */
function getSources(state) {
  return state.sources.get("sources");
}

function getSourcesText(state) {
  return state.sources.get("sourcesText");
}

function getSelectedSource(state) {
  return state.sources.get("selectedSource");
}

function sourceTreeHasChildren(item) {
  return item[1] instanceof Array;
}

function createParentMap(tree) {
  var map = new WeakMap();

  function _traverse(tree) {
    if(sourceTreeHasChildren(tree)) {
      tree[1].forEach(child => {
        map.set(child, tree);
        _traverse(child);
      });
    }
  }

  _traverse(tree);
  return map;
}

const getSourceTree = createSelector(
  state => state.sources.get("sourceTree"),
  tree => {
    console.log('ret', tree);
    return {
      tree: tree,
      parentMap: createParentMap(tree)
    };
  }
);

function getSelectedSourceOpts(state) {
  return state.sources.get("selectedSourceOpts");
}

function getBreakpoint(state, location) {
  return state.breakpoints.getIn(["breakpoints", makeLocationId(location)]);
}

function getBreakpoints(state) {
  return state.breakpoints.get("breakpoints");
}

function getBreakpointsForSource(state, sourceActor) {
  return state.breakpoints.get("breakpoints").filter(bp => {
    return bp.getIn(["location", "actor"]) === sourceActor;
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

function getIsWaitingOnBreak(state) {
  return state.pause.get("isWaitingOnBreak");
}

function getFrames(state) {
  return state.pause.get("frames");
}

function getSelectedFrame(state) {
  return state.pause.get("selectedFrame");
}

function getSource(state, actor) {
  return getSources(state).get(actor);
}

function getSourceCount(state) {
  return getSources(state).size;
}

function getSourceByURL(state, url) {
  return getSources(state).find(source => source.get("url") == url);
}

function getSourceByActor(state, actor) {
  return getSources(state).find(source => source.get("actor") == actor);
}

function getSourceText(state, actor) {
  return getSourcesText(state).get(actor);
}

/**
 * @param object - location
 */
function makeLocationId(location) {
  return location.actor + ":" + location.line.toString();
}

module.exports = {
  getSource,
  getSources,
  getSourceCount,
  getSourceByURL,
  getSourceByActor,
  getSourceTree,
  sourceTreeHasChildren,
  getSelectedSource,
  getSelectedSourceOpts,
  getSourceText,
  getBreakpoint,
  getBreakpoints,
  getBreakpointsForSource,
  getTabs,
  getSelectedTab,
  getPause,
  getIsWaitingOnBreak,
  getFrames,
  getSelectedFrame,
  makeLocationId
};
