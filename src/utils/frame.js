// @flow

const get = require("lodash/get");
import { isEnabled } from "devtools-config";
import { endTruncateStr } from "./utils";
import { getFilename } from "./source";
import findIndex from "lodash/findIndex";

import type { Frame } from "debugger-html";
import type { LocalFrame } from "../components/SecondaryPanes/Frames/types";

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

function isWebpack(frame) {
  return getFrameUrl(frame).match(/webpack\/bootstrap/i);
}

function isNodeInternal(frame) {
  // starts with "internal/" OR no path, just "timers.js", "url.js" etc
  // (normally frameUrl will be a FQ pathname)
  return /(^internal\/|^[^.\/]+\.js)/.test(getFrameUrl(frame));
}

function isExpress(frame) {
  return /node_modules\/express/.test(getFrameUrl(frame));
}

function isPug(frame) {
  return /node_modules\/pug/.test(getFrameUrl(frame));
}

function isExtJs(frame) {
  return /\/ext-all[\.\-]/.test(getFrameUrl(frame));
}

export function getLibraryFromUrl(frame: Frame) {
  // @TODO each of these fns calls getFrameUrl, just call it once
  // (assuming there's not more complex logic to identify a lib)

  if (isBackbone(frame)) {
    return "Backbone";
  }

  if (isJQuery(frame)) {
    return "jQuery";
  }

  if (isReact(frame)) {
    return "React";
  }

  if (isWebpack(frame)) {
    return "Webpack";
  }

  if (isNodeInternal(frame)) {
    return "Node";
  }

  if (isExpress(frame)) {
    return "Express";
  }

  if (isPug(frame)) {
    return "Pug";
  }

  if (isExtJs(frame)) {
    return "ExtJS";
  }
}

const displayNameMap = {
  Backbone: {
    "extend/child": "Create Class",
    ".create": "Create Model"
  },
  jQuery: {
    "jQuery.event.dispatch": "Dispatch Event"
  },
  React: {
    // eslint-disable-next-line max-len
    "ReactCompositeComponent._renderValidatedComponentWithoutOwnerOrContext/renderedElement<": "Render"
  },
  Webpack: {
    // eslint-disable-next-line camelcase
    __webpack_require__: "Bootstrap"
  }
};

function mapDisplayNames(frame, library) {
  const map = displayNameMap[library];
  const { displayName } = frame;
  return (map && map[displayName]) || displayName;
}

export function annotateFrame(frame: Frame) {
  if (!isEnabled("collapseFrame")) {
    return frame;
  }

  const library = getLibraryFromUrl(frame);
  if (library) {
    return Object.assign({}, frame, { library });
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

export function simplifyDisplayName(displayName: string) {
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

type formatDisplayNameParams = { shouldMapDisplayName: boolean };
export function formatDisplayName(
  frame: LocalFrame,
  { shouldMapDisplayName = true }: formatDisplayNameParams = {}
) {
  let { displayName, library } = frame;
  if (library && shouldMapDisplayName) {
    displayName = mapDisplayNames(frame, library);
  }

  displayName = simplifyDisplayName(displayName);
  return endTruncateStr(displayName, 25);
}

export function formatCopyName(frame: LocalFrame) {
  const displayName = formatDisplayName(frame);
  const fileName = getFilename(frame.source);
  const frameLocation = frame.location.line;

  return `${displayName} (${fileName}#${frameLocation})`;
}

export function collapseFrames(frames: Frame[]) {
  // We collapse groups of one so that user frames
  // are not in a group of one
  function addGroupToList(group, list) {
    if (!group) {
      return list;
    }

    if (group.length > 1) {
      list.push(group);
    } else {
      list = list.concat(group);
    }

    return list;
  }
  const { newFrames, lastGroup } = collapseLastFrames(frames);
  frames = newFrames;
  let items = [];
  let currentGroup = null;
  let prevItem = null;
  for (const frame of frames) {
    const prevLibrary = get(prevItem, "library");

    if (!currentGroup) {
      currentGroup = [frame];
    } else if (prevLibrary && prevLibrary == frame.library) {
      currentGroup.push(frame);
    } else {
      items = addGroupToList(currentGroup, items);
      currentGroup = [frame];
    }

    prevItem = frame;
  }

  items = addGroupToList(currentGroup, items);
  items = addGroupToList(lastGroup, items);
  return items;
}

function collapseLastFrames(frames) {
  const index = findIndex(frames, isWebpack);

  if (index == -1) {
    return { newFrames: frames, lastGroup: [] };
  }

  const newFrames = frames.slice(0, index);
  const lastGroup = frames.slice(index);
  return { newFrames, lastGroup };
}
