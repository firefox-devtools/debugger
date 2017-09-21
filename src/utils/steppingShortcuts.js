import { Services } from "devtools-modules";
const { appinfo } = Services;
import { formatKeyShortcut } from "./text";

const KEYS = {
  WINNT: {
    resume: "F8",
    pause: "F8",
    stepOver: "F10",
    stepIn: "F11",
    stepOut: "Shift+F11"
  },
  Darwin: {
    resume: "Cmd+\\",
    pause: "Cmd+\\",
    stepOver: "Cmd+'",
    stepIn: "Cmd+;",
    stepOut: "Cmd+Shift+:",
    stepOutDisplay: "Cmd+Shift+;"
  },
  Linux: {
    resume: "F8",
    pause: "F8",
    stepOver: "F10",
    stepIn: "Ctrl+F11",
    stepOut: "Ctrl+Shift+F11"
  }
};

export const isMacOS = appinfo.OS === "Darwin";
export const COMMANDS = ["resume", "stepOver", "stepIn", "stepOut"];

export function getKey(action) {
  return getKeyForOS(appinfo.OS, action);
}

export function getKeyForOS(os, action) {
  return KEYS[os][action];
}

export function formatKey(action) {
  const key = getKey(`${action}Display`) || getKey(action);
  if (isMacOS) {
    const winKey =
      getKeyForOS("WINNT", `${action}Display`) || getKeyForOS("WINNT", action);
    // display both Windows type and Mac specific keys
    return formatKeyShortcut([key, winKey].join(" "));
  }
  return formatKeyShortcut(key);
}
