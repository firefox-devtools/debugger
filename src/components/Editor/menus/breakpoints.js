/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import actions from "../../../actions";
import { bindActionCreators } from "redux";
import type { SourceLocation, Breakpoint } from "../../../types";

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

export const createConditionalBreakpointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-add-conditional-breakpoint",
  label: L10N.getStr("editor.addConditionalBreakpoint"),
  accelerator: L10N.getStr("toggleCondPanel.key"),
  accesskey: L10N.getStr("editor.addConditionBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location)
});

export const createLogBreakpointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-add-log-breakpoint",
  label: L10N.getStr("editor.addLogBreakpoint"),
  accelerator: L10N.getStr("toggleCondPanel.key"),
  accesskey: L10N.getStr("editor.addConditionBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location)
});

export const addConditionalBreakpointItem = (
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) => ({
  id: "node-menu-add-conditional-breakpoint",
  label: L10N.getStr("editor.addConditionBreakpoint"),
  accelerator: L10N.getStr("toggleCondPanel.key"),
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
  accelerator: L10N.getStr("toggleCondPanel.key"),
  accesskey: L10N.getStr("editor.addConditionBreakpoint.accesskey"),
  disabled: false,
  click: () => breakpointActions.openConditionalPanel(location)
});

export const conditionalBreakpointItem = (
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) => {
  const { condition, location } = breakpoint;
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
  accelerator: L10N.getStr("toggleCondPanel.key")
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
  accelerator: L10N.getStr("toggleCondPanel.key")
});

export const logPointItem = (
  breakpoint: Breakpoint,
  breakpointActions: BreakpointItemActions
) => {
  const { condition, location } = breakpoint;
  return condition
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
  return [
    removeBreakpointItem(breakpoint, breakpointActions),
    toggleDisabledBreakpointItem(breakpoint, breakpointActions),
    conditionalBreakpointItem(breakpoint, breakpointActions),
    logPointItem(breakpoint, breakpointActions)
  ];
}

export function createBreakpointItems(
  location: SourceLocation,
  breakpointActions: BreakpointItemActions
) {
  return [
    addBreakpointItem(location, breakpointActions),
    createConditionalBreakpointItem(location, breakpointActions),
    createLogBreakpointItem(location, breakpointActions)
  ];
}

export type BreakpointItemActions = {
  addBreakpoint: typeof actions.addBreakpoint,
  removeBreakpoint: typeof actions.removeBreakpoint,
  removeBreakpointsAtLine: typeof actions.removeBreakpointsAtLine,
  toggleDisabledBreakpoint: typeof actions.toggleDisabledBreakpoint,
  openConditionalPanel: typeof actions.openConditionalPanel
};

export function breakpointItemActions(dispatch: Function) {
  return bindActionCreators(
    {
      addBreakpoint: actions.addBreakpoint,
      removeBreakpoint: actions.removeBreakpoint,
      removeBreakpointsAtLine: actions.removeBreakpointsAtLine,
      disableBreakpoint: actions.disableBreakpoint,
      toggleDisabledBreakpoint: actions.toggleDisabledBreakpoint,
      openConditionalPanel: actions.openConditionalPanel
    },
    dispatch
  );
}
