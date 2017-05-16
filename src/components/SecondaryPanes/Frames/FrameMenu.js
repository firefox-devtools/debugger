// @flow
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../../utils/clipboard";
import type { LocalFrame } from "./types";

function formatMenuElement(label, accesskey, click, disabled = false) {
  return {
    id: "node-menu-copy-source",
    label,
    accesskey,
    disabled,
    click
  };
}

function copySourceElement(url) {
  const label = L10N.getStr("copySourceUrl");
  const key = L10N.getStr("copySourceUrl.accesskey");
  return formatMenuElement(label, key, () => copyToTheClipboard(url));
}

function copyStackTraceElement(copyStackTrace) {
  const label = L10N.getStr("copyStackTrace");
  const key = L10N.getStr("copyStackTrace.accesskey");
  return formatMenuElement(label, key, () => copyStackTrace());
}

export default function FrameMenu(
  frame: LocalFrame,
  copyStackTrace: Function,
  event: SyntheticKeyboardEvent
) {
  event.stopPropagation();
  event.preventDefault();

  const menuOptions = [];

  const source = frame.source;
  if (source) {
    const copySourceUrl = copySourceElement(source.url);
    menuOptions.push(copySourceUrl);
  }

  const copyStackTraceItem = copyStackTraceElement(copyStackTrace);

  menuOptions.push(copyStackTraceItem);

  showMenu(event, menuOptions);
}
