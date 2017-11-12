/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { get } from "lodash";
import { isEnabled } from "devtools-config";
import { endTruncateStr } from "./utils";
import { getFilename } from "./source";
import { find, findIndex } from "lodash";

import type { Frame } from "debugger-html";
import type { LocalFrame } from "../components/SecondaryPanes/Frames/types";

function getFrameUrl(frame) {
  return get(frame, "source.url", "") || "";
}

const libraryMap = [
  {
    label: "Backbone",
    pattern: /backbone/i
  },
  {
    label: "jQuery",
    pattern: /jquery/i
  },
  {
    label: "Preact",
    pattern: /preact/i
  },
  {
    label: "React",
    pattern: /react/i
  },
  {
    label: "Immutable",
    pattern: /immutable/i
  },
  {
    label: "Webpack",
    pattern: /webpack\/bootstrap/i
  },
  {
    label: "Node",
    pattern: /(^internal\/|^[^.\/]+\.js)/
  },
  {
    label: "Express",
    pattern: /node_modules\/express/
  },
  {
    label: "Pug",
    pattern: /node_modules\/pug/
  },
  {
    label: "ExtJS",
    pattern: /\/ext-all[\.\-]/
  },
  {
    label: "Underscore",
    pattern: /underscore/i
  },
  {
    label: "Lodash",
    pattern: /lodash/i
  },
  {
    label: "Ember",
    pattern: /ember/i
  },
  {
    label: "Choo",
    pattern: /choo/i
  },
  {
    label: "VueJS",
    pattern: /vue\.js/i
  },
  {
    label: "RxJS",
    pattern: /rxjs/i
  },
  {
    label: "Angular",
    pattern: /angular/i
  },
  {
    label: "Redux",
    pattern: /redux/i
  },
  {
    label: "Dojo",
    pattern: /dojo/i
  },
  {
    label: "Marko",
    pattern: /marko/i
  },
  {
    label: "NuxtJS",
    pattern: /[\._]nuxt/i
  },
  {
    label: "Aframe",
    pattern: /aframe/i
  },
  {
    label: "NextJS",
    pattern: /[\._]next/i
  }
];

export function getLibraryFromUrl(frame: Frame) {
  // @TODO each of these fns calls getFrameUrl, just call it once
  // (assuming there's not more complex logic to identify a lib)
  const frameUrl = getFrameUrl(frame);
  const match = find(libraryMap, o => frameUrl.match(o.pattern));
  return match && match.label;
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
    "ReactCompositeComponent._renderValidatedComponentWithoutOwnerOrContext/renderedElement<":
      "Render",
    _renderValidatedComponentWithoutOwnerOrContext: "Render"
  },
  VueJS: {
    "renderMixin/Vue.prototype._render": "Render"
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
    return { ...frame, library };
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

  for (const reg of scenarios) {
    const match = reg.exec(displayName);
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
  const index = findIndex(frames, frame =>
    getFrameUrl(frame).match(/webpack\/bootstrap/i)
  );

  if (index == -1) {
    return { newFrames: frames, lastGroup: [] };
  }

  const newFrames = frames.slice(0, index);
  const lastGroup = frames.slice(index);
  return { newFrames, lastGroup };
}
