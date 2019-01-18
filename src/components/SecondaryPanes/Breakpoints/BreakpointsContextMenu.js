/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { buildMenu, showMenu } from "devtools-contextmenu";
import { getSelectedLocation } from "../../../utils/source-maps";
import actions from "../../../actions";
import type { Breakpoint, Source } from "../../../types";

type Props = {
  breakpoint: Breakpoint,
  breakpoints: Breakpoint[],
  selectedSource: Source,
  removeBreakpoint: typeof actions.removeBreakpoint,
  removeBreakpoints: typeof actions.removeBreakpoints,
  removeAllBreakpoints: typeof actions.removeAllBreakpoints,
  toggleBreakpoints: typeof actions.toggleBreakpoints,
  toggleAllBreakpoints: typeof actions.toggleAllBreakpoints,
  toggleDisabledBreakpoint: typeof actions.toggleDisabledBreakpoint,
  selectSpecificLocation: typeof actions.selectSpecificLocation,
  setBreakpointOptions: typeof actions.setBreakpointOptions,
  openConditionalPanel: typeof actions.openConditionalPanel,
  contextMenuEvent: SyntheticEvent<HTMLElement>
};

export default function showContextMenu(props: Props) {
  const {
    breakpoint,
    breakpoints,
    selectedSource,
    removeBreakpoint,
    removeBreakpoints,
    removeAllBreakpoints,
    toggleBreakpoints,
    toggleAllBreakpoints,
    toggleDisabledBreakpoint,
    selectSpecificLocation,
    setBreakpointOptions,
    openConditionalPanel,
    contextMenuEvent
  } = props;

  contextMenuEvent.preventDefault();

  const deleteSelfLabel = L10N.getStr("breakpointMenuItem.deleteSelf2.label");
  const deleteAllLabel = L10N.getStr("breakpointMenuItem.deleteAll2.label");
  const deleteOthersLabel = L10N.getStr(
    "breakpointMenuItem.deleteOthers2.label"
  );
  const enableSelfLabel = L10N.getStr("breakpointMenuItem.enableSelf2.label");
  const enableAllLabel = L10N.getStr("breakpointMenuItem.enableAll2.label");
  const enableOthersLabel = L10N.getStr(
    "breakpointMenuItem.enableOthers2.label"
  );
  const disableSelfLabel = L10N.getStr("breakpointMenuItem.disableSelf2.label");
  const disableAllLabel = L10N.getStr("breakpointMenuItem.disableAll2.label");
  const disableOthersLabel = L10N.getStr(
    "breakpointMenuItem.disableOthers2.label"
  );
  const removeConditionLabel = L10N.getStr(
    "breakpointMenuItem.removeCondition2.label"
  );
  const addConditionLabel = L10N.getStr(
    "breakpointMenuItem.addCondition2.label"
  );
  const editConditionLabel = L10N.getStr(
    "breakpointMenuItem.editCondition2.label"
  );

  const deleteSelfKey = L10N.getStr("breakpointMenuItem.deleteSelf2.accesskey");
  const deleteAllKey = L10N.getStr("breakpointMenuItem.deleteAll2.accesskey");
  const deleteOthersKey = L10N.getStr(
    "breakpointMenuItem.deleteOthers2.accesskey"
  );
  const enableSelfKey = L10N.getStr("breakpointMenuItem.enableSelf2.accesskey");
  const enableAllKey = L10N.getStr("breakpointMenuItem.enableAll2.accesskey");
  const enableOthersKey = L10N.getStr(
    "breakpointMenuItem.enableOthers2.accesskey"
  );
  const disableSelfKey = L10N.getStr(
    "breakpointMenuItem.disableSelf2.accesskey"
  );
  const disableAllKey = L10N.getStr("breakpointMenuItem.disableAll2.accesskey");
  const disableOthersKey = L10N.getStr(
    "breakpointMenuItem.disableOthers2.accesskey"
  );
  const removeConditionKey = L10N.getStr(
    "breakpointMenuItem.removeCondition2.accesskey"
  );
  const editConditionKey = L10N.getStr(
    "breakpointMenuItem.editCondition2.accesskey"
  );
  const addConditionKey = L10N.getStr(
    "breakpointMenuItem.addCondition2.accesskey"
  );

  const selectedLocation = getSelectedLocation(breakpoint, selectedSource);
  const otherBreakpoints = breakpoints.filter(b => b.id !== breakpoint.id);
  const enabledBreakpoints = breakpoints.filter(b => !b.disabled);
  const disabledBreakpoints = breakpoints.filter(b => b.disabled);
  const otherEnabledBreakpoints = breakpoints.filter(
    b => !b.disabled && b.id !== breakpoint.id
  );
  const otherDisabledBreakpoints = breakpoints.filter(
    b => b.disabled && b.id !== breakpoint.id
  );

  const deleteSelfItem = {
    id: "node-menu-delete-self",
    label: deleteSelfLabel,
    accesskey: deleteSelfKey,
    disabled: false,
    click: () => {
      removeBreakpoint(breakpoint);
    }
  };

  const deleteAllItem = {
    id: "node-menu-delete-all",
    label: deleteAllLabel,
    accesskey: deleteAllKey,
    disabled: false,
    click: () => removeAllBreakpoints()
  };

  const deleteOthersItem = {
    id: "node-menu-delete-other",
    label: deleteOthersLabel,
    accesskey: deleteOthersKey,
    disabled: false,
    click: () => removeBreakpoints(otherBreakpoints)
  };

  const enableSelfItem = {
    id: "node-menu-enable-self",
    label: enableSelfLabel,
    accesskey: enableSelfKey,
    disabled: false,
    click: () => {
      toggleDisabledBreakpoint(breakpoint);
    }
  };

  const enableAllItem = {
    id: "node-menu-enable-all",
    label: enableAllLabel,
    accesskey: enableAllKey,
    disabled: false,
    click: () => toggleAllBreakpoints(false)
  };

  const enableOthersItem = {
    id: "node-menu-enable-others",
    label: enableOthersLabel,
    accesskey: enableOthersKey,
    disabled: false,
    click: () => toggleBreakpoints(false, otherDisabledBreakpoints)
  };

  const disableSelfItem = {
    id: "node-menu-disable-self",
    label: disableSelfLabel,
    accesskey: disableSelfKey,
    disabled: false,
    click: () => {
      toggleDisabledBreakpoint(breakpoint);
    }
  };

  const disableAllItem = {
    id: "node-menu-disable-all",
    label: disableAllLabel,
    accesskey: disableAllKey,
    disabled: false,
    click: () => toggleAllBreakpoints(true)
  };

  const disableOthersItem = {
    id: "node-menu-disable-others",
    label: disableOthersLabel,
    accesskey: disableOthersKey,
    click: () => toggleBreakpoints(true, otherEnabledBreakpoints)
  };

  const removeConditionItem = {
    id: "node-menu-remove-condition",
    label: removeConditionLabel,
    accesskey: removeConditionKey,
    disabled: false,
    click: () => setBreakpointOptions(selectedLocation, {})
  };

  const addConditionItem = {
    id: "node-menu-add-condition",
    label: addConditionLabel,
    accesskey: addConditionKey,
    click: () => {
      selectSpecificLocation(selectedLocation);
      openConditionalPanel(selectedLocation);
    }
  };

  const editConditionItem = {
    id: "node-menu-edit-condition",
    label: editConditionLabel,
    accesskey: editConditionKey,
    click: () => {
      selectSpecificLocation(selectedLocation);
      openConditionalPanel(selectedLocation);
    }
  };

  const hideEnableSelfItem = !breakpoint.disabled;
  const hideEnableAllItem = disabledBreakpoints.length === 0;
  const hideEnableOthersItem = otherDisabledBreakpoints.length === 0;
  const hideDisableAllItem = enabledBreakpoints.length === 0;
  const hideDisableOthersItem = otherEnabledBreakpoints.length === 0;
  const hideDisableSelfItem = breakpoint.disabled;

  const items = [
    { item: enableSelfItem, hidden: () => hideEnableSelfItem },
    { item: enableAllItem, hidden: () => hideEnableAllItem },
    { item: enableOthersItem, hidden: () => hideEnableOthersItem },
    {
      item: { type: "separator" },
      hidden: () =>
        hideEnableSelfItem && hideEnableAllItem && hideEnableOthersItem
    },
    { item: deleteSelfItem },
    { item: deleteAllItem },
    { item: deleteOthersItem, hidden: () => breakpoints.length === 1 },
    {
      item: { type: "separator" },
      hidden: () =>
        hideDisableSelfItem && hideDisableAllItem && hideDisableOthersItem
    },

    { item: disableSelfItem, hidden: () => hideDisableSelfItem },
    { item: disableAllItem, hidden: () => hideDisableAllItem },
    { item: disableOthersItem, hidden: () => hideDisableOthersItem },
    {
      item: { type: "separator" }
    },
    {
      item: addConditionItem,
      hidden: () => breakpoint.options.condition
    },
    {
      item: editConditionItem,
      hidden: () => !breakpoint.options.condition
    },
    {
      item: removeConditionItem,
      hidden: () => !breakpoint.options.condition
    }
  ];

  showMenu(contextMenuEvent, buildMenu(items));
}
