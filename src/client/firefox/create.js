/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
// This module converts Firefox specific types to the generic types

import type { Frame, Source, Location } from "debugger-html";
import type {
  PausedPacket,
  FramesResponse,
  FramePacket,
  SourcePayload
} from "./types";

export function createFrame(frame: FramePacket): Frame {
  let title;
  if (frame.type == "call") {
    const c = frame.callee;
    title =
      c.name || c.userDisplayName || c.displayName || L10N.getStr("anonymous");
  } else {
    title = `(${frame.type})`;
  }
  const location = {
    sourceId: frame.where.source.actor,
    line: frame.where.line,
    column: frame.where.column
  };

  return {
    id: frame.actor,
    displayName: title,
    location,
    generatedLocation: location,
    this: frame.this,
    scope: frame.environment
  };
}

export function createSource(
  source: SourcePayload,
  { supportsWasm }: { supportsWasm: boolean }
): Source {
  return {
    id: source.actor,
    url: source.url,
    isPrettyPrinted: false,
    isWasm: supportsWasm && source.introductionType === "wasm",
    sourceMapURL: source.sourceMapURL,
    isBlackBoxed: false,
    loadedState: "unloaded"
  };
}

export function createPause(
  packet: PausedPacket,
  response: FramesResponse
): any {
  // NOTE: useful when the debugger is already paused
  const frame = packet.frame || response.frames[0];

  return Object.assign({}, packet, {
    frame: createFrame(frame),
    frames: response.frames.map(createFrame)
  });
}

// Firefox only returns `actualLocation` if it actually changed,
// but we want it always to exist. Format `actualLocation` if it
// exists, otherwise use `location`.

export function createBreakpointLocation(
  location: Location,
  actualLocation?: Object
): Location {
  if (!actualLocation) {
    return location;
  }

  return {
    sourceId: actualLocation.source.actor,
    sourceUrl: actualLocation.source.url,
    line: actualLocation.line,
    column: actualLocation.column
  };
}
