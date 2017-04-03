// @flow
const expressions = require("./reducers/expressions");
const sources = require("./reducers/sources");
const pause = require("./reducers/pause");
const breakpoints = require("./reducers/breakpoints");
const eventListeners = require("./reducers/event-listeners");
const ui = require("./reducers/ui");
const coverage = require("./reducers/coverage");

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
  getPendingSelectedLocation: sources.getPendingSelectedLocation,
  getPrettySource: sources.getPrettySource,

  getBreakpoint: breakpoints.getBreakpoint,
  getBreakpoints: breakpoints.getBreakpoints,
  getPendingBreakpoints: breakpoints.getPendingBreakpoints,
  getBreakpointsForSource: breakpoints.getBreakpointsForSource,
  getBreakpointsDisabled: breakpoints.getBreakpointsDisabled,
  getBreakpointsLoading: breakpoints.getBreakpointsLoading,

  getPause: pause.getPause,
  getChromeScopes: pause.getChromeScopes,
  getLoadedObjects: pause.getLoadedObjects,
  getLoadedObject: pause.getLoadedObject,
  getObjectProperties: pause.getObjectProperties,
  getIsWaitingOnBreak: pause.getIsWaitingOnBreak,
  getShouldPauseOnExceptions: pause.getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions: pause.getShouldIgnoreCaughtExceptions,
  getFrames: pause.getFrames,
  getSelectedFrame: pause.getSelectedFrame,
  getDebuggeeUrl: pause.getDebuggeeUrl,

  getHitCountForSource: coverage.getHitCountForSource,
  getCoverageEnabled: coverage.getCoverageEnabled,

  getEventListeners: eventListeners.getEventListeners,

  getProjectSearchState: ui.getProjectSearchState,
  getFileSearchState: ui.getFileSearchState,
  getFileSearchQueryState: ui.getFileSearchQueryState,
  getFileSearchModifierState: ui.getFileSearchModifierState,
  getShownSource: ui.getShownSource,
  getPaneCollapse: ui.getPaneCollapse,

  getExpressions: expressions.getExpressions,
  getVisibleExpressions: expressions.getVisibleExpressions,
  getExpression: expressions.getExpression,
};
