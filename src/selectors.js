// @flow

const sources = require("./reducers/sources");
const pause = require("./reducers/pause");
const breakpoints = require("./reducers/breakpoints");
const eventListeners = require("./reducers/event-listeners");
const ui = require("./reducers/ui");

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
  getBreakpointsForSource: breakpoints.getBreakpointsForSource,
  getBreakpointsDisabled: breakpoints.getBreakpointsDisabled,
  getBreakpointsLoading: breakpoints.getBreakpointsLoading,

  getPause: pause.getPause,
  getChromeScopes: pause.getChromeScopes,
  getLoadedObjects: pause.getLoadedObjects,
  getExpressions: pause.getExpressions,
  getIsWaitingOnBreak: pause.getIsWaitingOnBreak,
  getShouldPauseOnExceptions: pause.getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions: pause.getShouldIgnoreCaughtExceptions,
  getFrames: pause.getFrames,
  getSelectedFrame: pause.getSelectedFrame,

  getEventListeners: eventListeners.getEventListeners,

  getFileSearchState: ui.getFileSearchState,
  getShownSource: ui.getShownSource
};
