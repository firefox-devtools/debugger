import { showMenu } from "devtools-launchpad";

export default function GutterMenu({
  breakpoint,
  line,
  event,
  pauseData,
  toggleBreakpoint,
  showConditionalPanel,
  toggleDisabledBreakpoint,
  isCbPanelOpen,
  closeConditionalPanel,
  continueToHere
}) {
  event.stopPropagation();
  event.preventDefault();

  const gutterItems = {
    addBreakpoint: {
      id: "node-menu-add-breakpoint",
      label: L10N.getStr("editor.addBreakpoint")
    },
    addConditional: {
      id: "node-menu-add-conditional-breakpoint",
      label: L10N.getStr("editor.addConditionalBreakpoint")
    },
    removeBreakpoint: {
      id: "node-menu-remove-breakpoint",
      label: L10N.getStr("editor.removeBreakpoint")
    },
    editConditional: {
      id: "node-menu-edit-conditional-breakpoint",
      label: L10N.getStr("editor.editBreakpoint")
    },
    enableBreakpoint: {
      id: "node-menu-enable-breakpoint",
      label: L10N.getStr("editor.enableBreakpoint")
    },
    disableBreakpoint: {
      id: "node-menu-disable-breakpoint",
      label: L10N.getStr("editor.disableBreakpoint")
    },
    continueToHere: {
      id: "node-menu-continue-to-here",
      label: L10N.getStr("editor.continueToHere.label")
    }
  };

  const toggleBreakpointItem = Object.assign(
    {
      accesskey: "B",
      disabled: false,
      click: () => {
        toggleBreakpoint(line);
        if (isCbPanelOpen) {
          closeConditionalPanel();
        }
      }
    },
    breakpoint ? gutterItems.removeBreakpoint : gutterItems.addBreakpoint
  );

  const conditionalBreakpoint = Object.assign(
    {
      accesskey: "C",
      disabled: false,
      click: () => showConditionalPanel(line)
    },
    breakpoint && breakpoint.condition
      ? gutterItems.editConditional
      : gutterItems.addConditional
  );

  const items = [toggleBreakpointItem, conditionalBreakpoint];

  if (pauseData) {
    const continueToHereItem = {
      accesskey: L10N.getStr("editor.continueToHere.accesskey"),
      disabled: false,
      click: () => continueToHere(line),
      ...gutterItems.continueToHere
    };
    items.push(continueToHereItem);
  }

  if (breakpoint) {
    const disableBreakpoint = Object.assign(
      {
        accesskey: "D",
        disabled: false,
        click: () => toggleDisabledBreakpoint(line)
      },
      breakpoint.disabled
        ? gutterItems.enableBreakpoint
        : gutterItems.disableBreakpoint
    );
    items.push(disableBreakpoint);
  }

  showMenu(event, items);
}
