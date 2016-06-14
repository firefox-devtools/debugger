"use strict";

const { Source, Location, Frame } = require("../../types");

let actions;

function setupEvents(dependencies) {
  actions = dependencies.actions;
}

function scriptParsed(scriptId, url, startLine, startColumn,
             endLine, endColumn, executionContextId, hash,
             isContentScript, isInternalScript, isLiveEdit,
             sourceMapURL, hasSourceURL, deprecatedCommentWasUsed) {
  actions.newSource(Source({ id: scriptId, url: url }));
}

function scriptFailedToParse() {}

function paused(callFrames, reason, data, hitBreakpoints, asyncStackTrace) {
  const frames = callFrames.map(frame => {
    return Frame({
      id: frame.callFrameId,
      displayName: frame.functionName,
      location: Location({
        sourceId: frame.location.scriptId,
        line: frame.location.lineNumber + 1,
        column: frame.location.columnNumber
      })
    });
  });

  const frame = frames[0];
  const why = Object.assign({}, {
    type: reason
  }, data);

  actions.paused({ frame, why });
  actions.loadedFrames(frames);
}

function resumed() {
  actions.resumed();
}

function globalObjectCleared() {
}

const clientEvents = {
  scriptParsed,
  scriptFailedToParse,
  paused,
  resumed,
  globalObjectCleared,
};

module.exports = {
  setupEvents,
  clientEvents
};
