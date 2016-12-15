// @flow

import type { Source, Frame } from '../../types';

function createFrame(frame): Source {
  let title;
  if (frame.type == "call") {
    let c = frame.callee;
    title = c.name || c.userDisplayName || c.displayName || "(anonymous)";
  } else {
    title = `(${ frame.type })`;
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

function createSource(source): Frame {
  return {
    id: source.actor,
    url: source.url,
    isPrettyPrinted: false,
    sourceMapURL: source.sourceMapURL
  };
}

module.exports = { createFrame, createSource };
