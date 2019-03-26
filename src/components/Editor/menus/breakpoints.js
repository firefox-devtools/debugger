/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import actions from "../../../actions";
import { bindActionCreators } from "redux";
import type { SourceLocation, Breakpoint } from "../../../types";
import { features } from "../../../utils/prefs";

export const addBreakpointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-add-breakpoint",
  label: L10N.getStr("editor.addBreakpoint"),
  accesskey: L10N.getStr("shortcuts.toggleBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.addBreakpoint(location),
  accelerator: L10N.getStr("toggleBreakpoint.key")
});

export const removeBreakpointItem = (
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-remove-breakpoint",
  label: L10N.getStr("editor.removeBreakpoint"),
  accesskey: L10N.getStr("shortcuts.toggleBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.removeBreakpoint(breakpoint),
  accelerator: L10N.getStr("toggleBreakpoint.key")
});

export const addConditionalBreakpointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-add-conditional-breakpoint",
  label: L10N.getStr("editor.addConditionBreakpoint"),
  accelerator: L10N.getStr("toggleCondPanel.breakpoint.key"),
  accesskey: L10N.getStr("editor.addConditionBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location)
});

export const editConditionalBreakpointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-edit-conditional-breakpoint",
  label: L10N.getStr("editor.editConditionBreakpoint"),
  accelerator: L10N.getStr("toggleCondPanel.breakpoint.key"),
  accesskey: L10N.getStr("editor.addConditionBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location)
});

export const conditionalBreakpointItem = (
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) => {
  const {
    options: { condition },
    location
  } = breakpoint;
  return condition
    ? editConditionalBreakpointItem(location, breakpointActions)
    : addConditionalBreakpointItem(location, breakpointActions);
};

export const addLogPointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-add-log-point",
  label: L10N.getStr("editor.addLogPoint"),
  accesskey: L10N.getStr("editor.addLogPoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location, true),
  accelerator: L10N.getStr("toggleCondPanel.logPoint.key")
});

export const editLogPointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-edit-log-point",
  label: L10N.getStr("editor.editLogPoint"),
  accesskey: L10N.getStr("editor.addLogPoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location, true),
  accelerator: L10N.getStr("toggleCondPanel.logPoint.key")
});

export const logPointItem = (
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) => {
  const {
    options: { logValue },
    location
  } = breakpoint;
  return logValue
    ? editLogPointItem(location, breakpointActions)
    : addLogPointItem(location, breakpointActions);
};

export const toggleDisabledBreakpointItem = (
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) => {
  return {
    accesskey: L10N.getStr("editor.disableBreakpoint.accesskey"),
    disabled: false,
    click: () => breakpointActions.toggleDisabledBreakpoint(breakpoint),
    ...(breakpoint.disabled
      ? {
          id: "node-menu-enable-breakpoint",
          label: L10N.getStr("editor.enableBreakpoint")
        }
      : {
          id: "node-menu-disable-breakpoint",
          label: L10N.getStr("editor.disableBreakpoint")
        })
  };
};

export function breakpointItems(
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) {
  const items = [
    removeBreakpointItem(breakpoint, breakpointActions),
    toggleDisabledBreakpointItem(breakpoint, breakpointActions)
  ];

  if (features.columnBreakpoints) {
    items.push(
      { type: "separator" },
      removeBreakpointsOnLineItem(breakpoint.location, breakpointActions),
      breakpoint.disabled
        ? enableBreakpointsOnLineItem(breakpoint.location, breakpointActions)
        : disableBreakpointsOnLineItem(breakpoint.location, breakpointActions),
      { type: "separator" }
    );
  }

  items.push(conditionalBreakpointItem(breakpoint, breakpointActions));

  if (features.logPoints) {
    items.push(logPointItem(breakpoint, breakpointActions));
  }

  return items;
}

export function createBreakpointItems(
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) {
  const items = [
    addBreakpointItem(location, breakpointActions),
    addConditionalBreakpointItem(location, breakpointActions)
  ];

  if (features.logPoints) {
    items.push(addLogPointItem(location, breakpointActions));
  }
  return items;
}

// ToDo: Only enable if there are more than one breakpoints on a line?
export const removeBreakpointsOnLineItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-remove-breakpoints-on-line",
  label: L10N.getStr("breakpointMenuItem.removeAllAtLine.label"),
  accesskey: L10N.getStr("breakpointMenuItem.removeAllAtLine.accesskey"),
  disabled: false,
  click: () =>
    breakpointActions.removeBreakpointsAtLine(location.sourceId, location.line)
});

export const enableBreakpointsOnLineItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-remove-breakpoints-on-line",
  label: L10N.getStr("breakpointMenuItem.enableAllAtLine.label"),
  accesskey: L10N.getStr("breakpointMenuItem.enableAllAtLine.accesskey"),
  disabled: false,
  click: () =>
    breakpointActions.enableBreakpointsAtLine(location.sourceId, location.line)
});

export const disableBreakpointsOnLineItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-remove-breakpoints-on-line",
  label: L10N.getStr("breakpointMenuItem.disableAllAtLine.label"),
  accesskey: L10N.getStr("breakpointMenuItem.disableAllAtLine.accesskey"),
  disabled: false,
  click: () =>
    breakpointActions.disableBreakpointsAtLine(location.sourceId, location.line)
});

export type BreakpointItemActions = {
  addBreakpoint: typeof actions.addBreakpoint,
  removeBreakpoint: typeof actions.removeBreakpoint,
  removeBreakpointsAtLine: typeof actions.removeBreakpointsAtLine,
  enableBreakpointsAtLine: typeof actions.enableBreakpointsAtLine,
  disableBreakpointsAtLine: typeof actions.disableBreakpointsAtLine,
  toggleDisabledBreakpoint: typeof actions.toggleDisabledBreakpoint,
  openConditionalPanel: typeof actions.openConditionalPanel
};

export function breakpointItemActions(dispatch: Function) {
  return bindActionCreators(
    {
      addBreakpoint: actions.addBreakpoint,
      removeBreakpoint: actions.removeBreakpoint,
      removeBreakpointsAtLine: actions.removeBreakpointsAtLine,
      enableBreakpointsAtLine: actions.enableBreakpointsAtLine,
      disableBreakpointsAtLine: actions.disableBreakpointsAtLine,
      disableBreakpoint: actions.disableBreakpoint,
      toggleDisabledBreakpoint: actions.toggleDisabledBreakpoint,
      openConditionalPanel: actions.openConditionalPanel
    },
    dispatch
  );
}
