import { showMenu } from "devtools-launchpad";

export default function GutterMenu(
  {
    bp,
    line,
    event,
    toggleBreakpoint,
    showConditionalPanel,
    toggleBreakpointDisabledStatus,
    isCbPanelOpen,
    closeConditionalPanel
  }
) {
  event.stopPropagation();
  event.preventDefault();
  let breakpoint = {
    id: "node-menu-add-breakpoint",
    label: L10N.getStr("editor.addBreakpoint")
  },
    conditional = {
      id: "node-menu-add-conditional-breakpoint",
      label: L10N.getStr("editor.addConditionalBreakpoint")
    },
    disabled;
  if (bp) {
    breakpoint = {
      id: "node-menu-remove-breakpoint",
      label: L10N.getStr("editor.removeBreakpoint")
    };
    conditional = {
      id: "node-menu-edit-conditional-breakpoint",
      label: L10N.getStr("editor.editBreakpoint")
    };
    if (bp.disabled) {
      disabled = {
        id: "node-menu-enable-breakpoint",
        label: L10N.getStr("editor.enableBreakpoint")
      };
    } else {
      disabled = {
        id: "node-menu-disable-breakpoint",
        label: L10N.getStr("editor.disableBreakpoint")
      };
    }
  }

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
    breakpoint
  );

  const conditionalBreakpoint = Object.assign(
    {
      accesskey: "C",
      disabled: false,
      click: () => showConditionalPanel(line)
    },
    conditional
  );

  let items = [toggleBreakpointItem, conditionalBreakpoint];

  if (bp) {
    const disableBreakpoint = Object.assign(
      {
        accesskey: "D",
        disabled: false,
        click: () => toggleBreakpointDisabledStatus(line)
      },
      disabled
    );
    items.push(disableBreakpoint);
  }

  showMenu(event, items);
}
