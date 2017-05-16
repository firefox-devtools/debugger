// @flow
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../../utils/clipboard";
import type { LocalFrame } from "./types";

export default function FrameMenu(
  frame: LocalFrame,
  copyStackTrace: Function,
  event: SyntheticKeyboardEvent
) {
  const copySourceUrlLabel = L10N.getStr("copySourceUrl");
  const copySourceUrlKey = L10N.getStr("copySourceUrl.accesskey");
  const copyStackTraceLabel = L10N.getStr("copyStackTrace");
  const copyStackTraceKey = L10N.getStr("copyStackTrace.accesskey");

  event.stopPropagation();
  event.preventDefault();

  const menuOptions = [];

  const source = frame.source;
  if (source) {
    const copySourceUrl = {
      id: "node-menu-copy-source",
      label: copySourceUrlLabel,
      accesskey: copySourceUrlKey,
      disabled: false,
      click: () => copyToTheClipboard(source.url)
    };

    menuOptions.push(copySourceUrl);
  }

  const copyStackTraceItem = {
    id: "node-menu-copy-source",
    label: copyStackTraceLabel,
    accesskey: copyStackTraceKey,
    disabled: false,
    click: () => copyStackTrace()
  };

  menuOptions.push(copyStackTraceItem);

  showMenu(event, menuOptions);
}
