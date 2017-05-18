// @flow
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../../utils/clipboard";
import type { LocalFrame } from "./types";
import type { ContextMenuItem } from "debugger-html";
import { kebabCase } from "lodash";

function formatMenuElement(
  label: string,
  accesskey: string,
  click: Function,
  disabled: boolean = false
): ContextMenuItem {
  const id = `node-menu-${kebabCase(label)}`;
  return {
    id,
    label,
    accesskey,
    disabled,
    click
  };
}

function copySourceElement(url) {
  return formatMenuElement(
    L10N.getStr("copySourceUrl"),
    L10N.getStr("copySourceUrl.accesskey"),
    () => copyToTheClipboard(url)
  );
}

function copyStackTraceElement(copyStackTrace) {
  return formatMenuElement(
    L10N.getStr("copyStackTrace"),
    L10N.getStr("copyStackTrace.accesskey"),
    () => copyStackTrace()
  );
}

function toggleFrameworkGroupingElement(
  toggleFrameworkGrouping,
  frameworkGroupingOn
) {
  const actionType = frameworkGroupingOn ? "Disable" : "Enable";
  return formatMenuElement(
    L10N.getFormatStr("framework.toggleGrouping", actionType),
    L10N.getStr("framework.accesskey"),
    () => toggleFrameworkGrouping()
  );
}

export default function FrameMenu(
  frame: LocalFrame,
  frameworkGroupingOn: boolean,
  callbacks: Object,
  event: SyntheticKeyboardEvent
) {
  event.stopPropagation();
  event.preventDefault();

  const menuOptions = [];

  const source = frame.source;

  const toggleFrameworkElement = toggleFrameworkGroupingElement(
    callbacks.toggleFrameworkGrouping,
    frameworkGroupingOn
  );
  menuOptions.push(toggleFrameworkElement);

  if (source) {
    const copySourceUrl = copySourceElement(source.url);
    menuOptions.push(copySourceUrl);
  }

  const copyStackTraceItem = copyStackTraceElement(callbacks.copyStackTrace);

  menuOptions.push(copyStackTraceItem);

  showMenu(event, menuOptions);
}
