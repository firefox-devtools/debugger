// @flow
import expressions from "./reducers/expressions";
import sources from "./reducers/sources";
import pause from "./reducers/pause";
import breakpoints from "./reducers/breakpoints";
import eventListeners from "./reducers/event-listeners";
import ui from "./reducers/ui";
import coverage from "./reducers/coverage";

/**
 * @param object - location
 */

export default {
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
  getLoadedObject: pause.getLoadedObject,
  getObjectProperties: pause.getObjectProperties,
  getIsWaitingOnBreak: pause.getIsWaitingOnBreak,
  getShouldPauseOnExceptions: pause.getShouldPauseOnExceptions,
  getShouldIgnoreCaughtExceptions: pause.getShouldIgnoreCaughtExceptions,
  getFrames: pause.getFrames,
  getSelectedFrame: pause.getSelectedFrame,

  getHitCountForSource: coverage.getHitCountForSource,
  getCoverageEnabled: coverage.getCoverageEnabled,

  getEventListeners: eventListeners.getEventListeners,

  getFileSearchState: ui.getFileSearchState,
  getShownSource: ui.getShownSource,
  getPaneCollapse: ui.getPaneCollapse,

  getExpressions: expressions.getExpressions,
};
