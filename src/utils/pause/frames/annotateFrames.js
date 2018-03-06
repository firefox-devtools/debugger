/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { flatMap, zip, range } from "lodash";

import type { Frame } from "../../../types";
import { getFrameUrl } from "./getFrameUrl";
import { getLibraryFromUrl } from "./getLibraryFromUrl";

export function annotateFrames(frames: Frame[]) {
  const annotatedFrames = frames.map(annotateFrame);
  return annotateBabelAsyncFrames(annotatedFrames);
}

function annotateFrame(frame: Frame) {
  const library = getLibraryFromUrl(frame);
  if (library) {
    return { ...frame, library };
  }

  return frame;
}

function annotateBabelAsyncFrames(frames: Frame[]) {
  const babelFrameIndexes = getBabelFrameIndexes(frames);
  const isBabelFrame = frameIndex => babelFrameIndexes.includes(frameIndex);

  return frames.map(
    (frame, frameIndex) =>
      isBabelFrame(frameIndex) ? { ...frame, library: "Babel" } : frame
  );
}

// Receives an array of frames and looks for babel async
// call stack groups.
function getBabelFrameIndexes(frames) {
  const startIndexes = getFrameIndices(
    frames,
    (displayName, url) =>
      url.match(/regenerator-runtime/i) && displayName === "tryCatch"
  );

  const endIndexes = getFrameIndices(
    frames,
    (displayName, url) =>
      displayName === "_asyncToGenerator/<" ||
      (url.match(/_microtask/i) && displayName === "flush")
  );

  if (startIndexes.length != endIndexes.length || startIndexes.length === 0) {
    return frames;
  }

  // Receives an array of start and end index tuples and returns
  // an array of async call stack index ranges.
  // e.g. [[1,3], [5,7]] => [[1,2,3], [5,6,7]]
  return flatMap(zip(startIndexes, endIndexes), ([startIndex, endIndex]) =>
    range(startIndex, endIndex + 1)
  );
}

function getFrameIndices(frames, predicate) {
  return frames.reduce(
    (accumulator, frame, index) =>
      predicate(frame.displayName, getFrameUrl(frame))
        ? [...accumulator, index]
        : accumulator,
    []
  );
}
