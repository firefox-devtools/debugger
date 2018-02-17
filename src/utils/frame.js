/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { endTruncateStr } from "./utils";
import { getFilename } from "./source";
import { get, find, findIndex, flow } from "lodash";

import type { Frame } from "../types";
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
    label: "MobX",
    pattern: /mobx/i
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

export const collapseFrames: (Frame[]) => Array<Frame | Frame[]> = flow(
  collapseLastWebpackFrames,
  collapseBabelAsyncFrames,
  collapseRemainingFrames
);

function collapseLastWebpackFrames(frames: Frame[]) {
  const index = findIndex(frames, frame =>
    getFrameUrl(frame).match(/webpack\/bootstrap/i)
  );
  if (index === -1) {
    return frames;
  }

  const webpackFrames = frames.slice(index);
  frames.splice(index, webpackFrames.length, webpackFrames);
  return frames;
}

function collapseBabelAsyncFrames(frames: Frame[]) {
  const lastIndex = findIndex(
    frames,
    frame => frame.displayName && frame.displayName.match(/_asyncToGenerator/)
  );
  if (lastIndex === -1) {
    return frames;
  }
  const firstIndex = findIndex(frames, frame =>
    getFrameUrl(frame).match(/regenerator-runtime/i)
  );
  if (firstIndex === -1) {
    return frames;
  }

  const babelAsyncFrames = frames.slice(firstIndex, lastIndex + 1);
  frames.splice(firstIndex, babelAsyncFrames.length, babelAsyncFrames);
  return frames;
}

function collapseRemainingFrames(frames: Array<Frame | Frame[]>) {
  return frames.reduce((accumulator, current, currentIndex) => {
    // If current is already in a group, or it's the first item, keep it as is
    if (Array.isArray(current) || currentIndex === 0) {
      return accumulator.concat(current);
    }
    const previous = accumulator.pop();
    // If previous and current are frames in the same library, group them
    if (previous.library === current.library) {
      return accumulator.concat([[previous, current]]);
    }
    // If previous is a group and current belongs to it, add current to previous
    if (previous[0] && previous[0].library === current.library) {
      return accumulator.concat([previous.concat(current)]);
    }
    return accumulator.concat(previous, current);
  }, []);
}
