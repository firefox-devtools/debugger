const { Source, Frame, Location } = require("../../types");

function createFrame(frame) {
  let title;
  if (frame.type == "call") {
    let c = frame.callee;
    title = c.name || c.userDisplayName || c.displayName || "(anonymous)";
  } else {
    title = "(" + frame.type + ")";
  }

  return Frame({
    id: frame.actor,
    displayName: title,
    location: Location({
      sourceId: frame.where.source.actor,
      line: frame.where.line,
      column: frame.where.column
    }),
    this: frame.this,
    scope: frame.environment
  });
}

function createSource(source) {
  return Source({
    id: source.actor,
    url: source.url,
    isPrettyPrinted: false,
    sourceMapURL: source.sourceMapURL
  });
}

module.exports = { createFrame, createSource };
