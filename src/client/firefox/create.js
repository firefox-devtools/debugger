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
    let c = frame.callee;
    title = c.name || c.userDisplayName || c.displayName || "(anonymous)";
  } else {
    title = `(${frame.type})`;
  }

  return {
    id: frame.actor,
    displayName: title,
    location: {
      sourceId: frame.where.source.actor,
      line: frame.where.line,
      column: frame.where.column
    },
    this: frame.this,
    scope: frame.environment
  };
}

export function createSource(source: SourcePayload): Source {
  return {
    id: source.actor,
    url: source.url,
    isPrettyPrinted: false,
    sourceMapURL: source.sourceMapURL,
    isBlackBoxed: false
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
    sourceUrl: location.sourceUrl,
    line: actualLocation.line,
    column: actualLocation.column
  };
}
