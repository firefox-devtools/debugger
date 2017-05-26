// @flow
import * as expressions from "./reducers/expressions";
import * as sources from "./reducers/sources";
import * as pause from "./reducers/pause";
import * as breakpoints from "./reducers/breakpoints";
import * as eventListeners from "./reducers/event-listeners";
import * as ui from "./reducers/ui";
import * as ast from "./reducers/ast";
import * as coverage from "./reducers/coverage";

/**
 * @param object - location
 */

module.exports = {
  getSource: sources.getSource,
  getSourceByURL: sources.getSourceByURL,
  getSourceInSources: sources.getSourceInSources,
  getSources: sources.getSources,
  getSourceText: sources.getSourceText,
  getSourceTabs: sources.getSourceTabs,
  getSourcesForTabs: sources.getSourcesForTabs,
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
  getFrameworkGroupingState: ui.getFrameworkGroupingState,
  getSymbolSearchState: ui.getSymbolSearchState,
  getSymbolSearchType: ui.getSymbolSearchType,
  getShownSource: ui.getShownSource,
  getPaneCollapse: ui.getPaneCollapse,

  getExpressions: expressions.getExpressions,
  getVisibleExpressions: expressions.getVisibleExpressions,
  getExpression: expressions.getExpression,
  getHighlightedLineRange: ui.getHighlightedLineRange,

  getSymbols: ast.getSymbols,
  hasSymbols: ast.hasSymbols
};
