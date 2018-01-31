import { buildMenu, showMenu } from "devtools-contextmenu";

export default function showContextMenu(props) {
  const {
    removeBreakpoint,
    removeBreakpoints,
    removeAllBreakpoints,
    toggleBreakpoints,
    toggleAllBreakpoints,
    toggleDisabledBreakpoint,
    selectLocation,
    setBreakpointCondition,
    openConditionalPanel,
    breakpoints,
    breakpoint,
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

  const otherBreakpoints = breakpoints.filter(b => b !== breakpoint);
  const enabledBreakpoints = breakpoints.filter(b => !b.disabled);
  const disabledBreakpoints = breakpoints.filter(b => b.disabled);
  const otherEnabledBreakpoints = breakpoints.filter(
    b => !b.disabled && b !== breakpoint
  );
  const otherDisabledBreakpoints = breakpoints.filter(
    b => b.disabled && b !== breakpoint
  );

  const deleteSelfItem = {
    id: "node-menu-delete-self",
    label: deleteSelfLabel,
    accesskey: deleteSelfKey,
    disabled: false,
    click: () => removeBreakpoint(breakpoint.location)
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
    click: () => toggleDisabledBreakpoint(breakpoint.location.line)
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
    click: () => toggleDisabledBreakpoint(breakpoint.location.line)
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
    click: () => setBreakpointCondition(breakpoint.location)
  };

  const addConditionItem = {
    id: "node-menu-add-condition",
    label: addConditionLabel,
    accesskey: addConditionKey,
    click: () => {
      selectLocation(breakpoint.location);
      openConditionalPanel(breakpoint.location.line);
    }
  };

  const editConditionItem = {
    id: "node-menu-edit-condition",
    label: editConditionLabel,
    accesskey: editConditionKey,
    click: () => {
      selectLocation(breakpoint.location);
      openConditionalPanel(breakpoint.location.line);
    }
  };

  const hideEnableSelf = !breakpoint.disabled;
  const hideEnableAll = disabledBreakpoints.size === 0;
  const hideEnableOthers = otherDisabledBreakpoints.size === 0;
  const hideDisableAll = enabledBreakpoints.size === 0;
  const hideDisableOthers = otherEnabledBreakpoints.size === 0;
  const hideDisableSelf = breakpoint.disabled;

  const items = [
    { item: enableSelfItem, hidden: () => hideEnableSelf },
    { item: enableAllItem, hidden: () => hideEnableAll },
    { item: enableOthersItem, hidden: () => hideEnableOthers },
    {
      item: { type: "separator" },
      hidden: () => hideEnableSelf && hideEnableAll && hideEnableOthers
    },
    { item: deleteSelfItem },
    { item: deleteAllItem },
    { item: deleteOthersItem, hidden: () => breakpoints.size === 1 },
    {
      item: { type: "separator" },
      hidden: () => hideDisableSelf && hideDisableAll && hideDisableOthers
    },

    { item: disableSelfItem, hidden: () => hideDisableSelf },
    { item: disableAllItem, hidden: () => hideDisableAll },
    { item: disableOthersItem, hidden: () => hideDisableOthers },
    {
      item: { type: "separator" }
    },
    {
      item: addConditionItem,
      hidden: () => breakpoint.condition
    },
    {
      item: editConditionItem,
      hidden: () => !breakpoint.condition
    },
    {
      item: removeConditionItem,
      hidden: () => !breakpoint.condition
    }
  ];

  showMenu(contextMenuEvent, buildMenu(items));
}
