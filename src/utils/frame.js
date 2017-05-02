import get from "lodash/get";
import { isEnabled } from "devtools-config";
import { endTruncateStr } from "./utils";
import { getFilename } from "./source";

import type { Frame } from "debugger-html";

function getFrameUrl(frame) {
  return get(frame, "source.url", "") || "";
}

function isBackbone(frame) {
  return getFrameUrl(frame).match(/backbone/i);
}

function isJQuery(frame) {
  return getFrameUrl(frame).match(/jquery/i);
}

function isReact(frame) {
  return getFrameUrl(frame).match(/react/i);
}

const displayNameMap = {
  Backbone: {
    "extend/child": "Create Class",
    ".create": "Create Model"
  },
  jQuery: {
    "jQuery.event.dispatch": "Dispatch Event"
  },
  React: {}
};

function mapDisplayNames(frame, library) {
  const map = displayNameMap[library];
  const { displayName } = frame;
  return (map && map[displayName]) || displayName;
}

export function annotateFrame(frame) {
  if (!isEnabled("collapseFrame")) {
    return frame;
  }

  if (isBackbone(frame)) {
    return Object.assign({}, frame, { library: "Backbone" });
  }

  if (isJQuery(frame)) {
    return Object.assign({}, frame, { library: "jQuery" });
  }

  if (isReact(frame)) {
    return Object.assign({}, frame, { library: "React" });
  }

  return frame;
}

// Decodes an anonymous naming scheme that
// spider monkey implements based on "Naming Anonymous JavaScript Functions"
// http://johnjbarton.github.io/nonymous/index.html
const objectProperty = /([\w\d]+)$/;
const arrayProperty = /\[(.*?)\]$/;
const functionProperty = /([\w\d]+)[\/\.<]*?$/;
const annonymousProperty = /([\w\d]+)\(\^\)$/;

export function simplifyDisplayName(displayName) {
  // if the display name has a space it has already been mapped
  if (/\s/.exec(displayName)) {
    return displayName;
  }

  const scenarios = [
    objectProperty,
    arrayProperty,
    functionProperty,
    annonymousProperty
  ];

  for (let reg of scenarios) {
    let match = reg.exec(displayName);
    if (match) {
      return match[1];
    }
  }

  return displayName;
}

export function formatDisplayName(frame: Frame) {
  const { displayName, library } = frame;
  if (library) {
    displayName = mapDisplayNames(frame, library);
  }

  displayName = simplifyDisplayName(displayName);
  return endTruncateStr(displayName, 25);
}

export function formatCopyName(frame: Frame) {
  const displayName = formatDisplayName(frame);
  const fileName = getFilename(frame.source);
  const frameLocation = frame.location.line;

  return `${displayName} (${fileName}#${frameLocation})`;
}
