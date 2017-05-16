// @flow
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../../utils/clipboard";
import type { LocalFrame } from "./types";
import type { ContextMenuItem } from "debugger-html";
import kebabCase from "lodash.kebabcase";

function formatMenuElement(
  labelString: string,
  accesskeyString: string,
  click: Function,
  disabled: boolean = false
): ContextMenuItem {
  const label = L10N.getStr(labelString);
  const accesskey = L10N.getStr(accesskeyString);
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
  return formatMenuElement("copySourceUrl", "copySourceUrl.accesskey", () =>
    copyToTheClipboard(url)
  );
}

function copyStackTraceElement(copyStackTrace) {
  return formatMenuElement("copyStackTrace", "copyStackTrace.accesskey", () =>
    copyStackTrace()
  );
}

function toggleFrameworkGroupingElement(
  toggleFrameworkGrouping,
  frameworkGroupingOn
) {
  const actionType = frameworkGroupingOn
    ? "framework.disableGrouping"
    : "framework.enableGrouping";

  return formatMenuElement(actionType, "framework.accesskey", () =>
    toggleFrameworkGrouping()
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
