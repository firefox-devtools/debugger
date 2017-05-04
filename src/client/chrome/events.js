// @flow

const { createFrame, createLoadedObject } = require("./create");

let actions;
let pageAgent;
let clientType;
let runtimeAgent;

function setupEvents(dependencies: any) {
  actions = dependencies.actions;
  pageAgent = dependencies.Page;
  clientType = dependencies.clientType;
  runtimeAgent = dependencies.Runtime;
}

// Debugger Events
function scriptParsed(
  {
    scriptId,
    url,
    startLine,
    startColumn,
    endLine,
    endColumn,
    executionContextId,
    hash,
    isContentScript,
    isInternalScript,
    isLiveEdit,
    sourceMapURL,
    hasSourceURL,
    deprecatedCommentWasUsed
  }: any
) {
  if (isContentScript) {
    return;
  }

  if (clientType == "node") {
    sourceMapURL = undefined;
  }

  actions.newSource({
    id: scriptId,
    url,
    sourceMapURL,
    isPrettyPrinted: false
  });
}

function scriptFailedToParse() {}

async function paused(
  {
    callFrames,
    reason,
    data,
    hitBreakpoints,
    asyncStackTrace
  }: any
) {
  const frames = callFrames.map(createFrame);
  const frame = frames[0];
  const why = Object.assign(
    {},
    {
      type: reason
    },
    data
  );

  const objectId = frame.scopeChain[0].object.objectId;
  const { result } = await runtimeAgent.getProperties({
    objectId
  });

  const loadedObjects = result.map(createLoadedObject);

  if (clientType == "chrome") {
    pageAgent.configureOverlay({ message: "Paused in debugger.html" });
  }

  await actions.paused({ frame, why, frames, loadedObjects });
}

function resumed() {
  if (clientType == "chrome") {
    pageAgent.configureOverlay({ suspended: false });
  }

  actions.resumed();
}

function globalObjectCleared() {}

// Page Events
function frameNavigated(frame: any) {
  actions.navigated();
}

function frameStartedLoading() {
  actions.willNavigate();
}

function domContentEventFired() {}

function loadEventFired() {}

function frameStoppedLoading() {}

const clientEvents = {
  scriptParsed,
  scriptFailedToParse,
  paused,
  resumed,
  globalObjectCleared
};

const pageEvents = {
  frameNavigated,
  frameStartedLoading,
  domContentEventFired,
  loadEventFired,
  frameStoppedLoading
};

module.exports = {
  setupEvents,
  pageEvents,
  clientEvents
};
