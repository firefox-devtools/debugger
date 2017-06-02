// @flow

import type {
  BreakpointId,
  BreakpointResult,
  FrameId,
  ActorId,
  Location,
  Script,
  Source,
  SourceId
} from "../types";

import type {
  TabTarget,
  DebuggerClient,
  Grip,
  ThreadClient,
  ObjectClient,
  BreakpointClient,
  BreakpointResponse
} from "./types";

const { createSource } = require("./create");

let bpClients: { [id: ActorId]: BreakpointClient };
let threadClient: ThreadClient;
let tabTarget: TabTarget;
let debuggerClient: DebuggerClient | null;

type Dependencies = {
  threadClient: ThreadClient,
  tabTarget: TabTarget,
  debuggerClient: DebuggerClient | null
};

function setupCommands(dependencies: Dependencies): void {
  threadClient = dependencies.threadClient;
  tabTarget = dependencies.tabTarget;
  debuggerClient = dependencies.debuggerClient;
  bpClients = {};
}

function resume(): Promise<*> {
  return new Promise(resolve => {
    threadClient.resume(resolve);
  });
}

function stepIn(): Promise<*> {
  return new Promise(resolve => {
    threadClient.stepIn(resolve);
  });
}

function stepOver(): Promise<*> {
  return new Promise(resolve => {
    threadClient.stepOver(resolve);
  });
}

function stepOut(): Promise<*> {
  return new Promise(resolve => {
    threadClient.stepOut(resolve);
  });
}

function breakOnNext(): Promise<*> {
  return threadClient.breakOnNext();
}

function sourceContents(sourceId: SourceId): Source {
  const sourceClient = threadClient.source({ actor: sourceId });
  return sourceClient.source();
}

function setBreakpoint(
  location: Location,
  condition: boolean,
  noSliding: boolean
): Promise<BreakpointResult> {
  const sourceClient = threadClient.source({ actor: location.sourceId });

  return sourceClient
    .setBreakpoint({
      line: location.line,
      column: location.column,
      condition,
      noSliding
    })
    .then((res: BreakpointResponse) => onNewBreakpoint(location, res));
}

function onNewBreakpoint(
  location: Location,
  res: BreakpointResponse
): BreakpointResult {
  const bpClient = res[1];
  let actualLocation = res[0].actualLocation;

  bpClients[bpClient.actor] = bpClient;

  // Firefox only returns `actualLocation` if it actually changed,
  // but we want it always to exist. Format `actualLocation` if it
  // exists, otherwise use `location`.
  actualLocation = actualLocation
    ? {
        sourceId: actualLocation.source.actor,
        sourceUrl: location.sourceUrl,
        line: actualLocation.line,
        column: actualLocation.column
      }
    : location;

  return {
    id: bpClient.actor,
    actualLocation
  };
}

function removeBreakpoint(breakpointId: BreakpointId) {
  const bpClient = bpClients[breakpointId];
  delete bpClients[breakpointId];
  return bpClient.remove();
}

function setBreakpointCondition(
  breakpointId: BreakpointId,
  location: Location,
  condition: boolean,
  noSliding: boolean
) {
  let bpClient = bpClients[breakpointId];
  delete bpClients[breakpointId];

  return bpClient
    .setCondition(threadClient, condition, noSliding)
    .then(_bpClient => onNewBreakpoint(location, [{}, _bpClient]));
}

type EvaluateParam = {
  frameId?: FrameId
};

function evaluate(script: Script, { frameId }: EvaluateParam) {
  const params = frameId ? { frameActor: frameId } : {};
  return new Promise(resolve => {
    tabTarget.activeConsole.evaluateJS(
      script,
      result => resolve(result),
      params
    );
  });
}

function debuggeeCommand(script: Script) {
  tabTarget.activeConsole.evaluateJS(script, () => {}, {});

  if (!debuggerClient) {
    return;
  }

  const consoleActor = tabTarget.form.consoleActor;
  const request = debuggerClient._activeRequests.get(consoleActor);
  request.emit("json-reply", {});
  debuggerClient._activeRequests.delete(consoleActor);

  return Promise.resolve();
}

function navigate(url: string): Promise<*> {
  return tabTarget.activeTab.navigateTo(url);
}

function reload(): Promise<*> {
  return tabTarget.activeTab.reload();
}

function getProperties(grip: Grip): Promise<*> {
  const objClient = threadClient.pauseGrip(grip);

  return objClient.getPrototypeAndProperties().then(resp => {
    const { ownProperties, safeGetterValues } = resp;
    for (const name in safeGetterValues) {
      const { enumerable, writable, getterValue } = safeGetterValues[name];
      ownProperties[name] = { enumerable, writable, value: getterValue };
    }
    return resp;
  });
}

function pauseOnExceptions(
  shouldPauseOnExceptions: boolean,
  shouldIgnoreCaughtExceptions: boolean
): Promise<*> {
  return threadClient.pauseOnExceptions(
    shouldPauseOnExceptions,
    shouldIgnoreCaughtExceptions
  );
}

function prettyPrint(sourceId: SourceId, indentSize: number): Promise<*> {
  const sourceClient = threadClient.source({ actor: sourceId });
  return sourceClient.prettyPrint(indentSize);
}

async function blackBox(sourceId: SourceId, isBlackBoxed: boolean): Promise<*> {
  const sourceClient = threadClient.source({ actor: sourceId });
  if (isBlackBoxed) {
    await sourceClient.unblackBox();
  } else {
    await sourceClient.blackBox();
  }

  return { isBlackBoxed: !isBlackBoxed };
}

function disablePrettyPrint(sourceId: SourceId): Promise<*> {
  const sourceClient = threadClient.source({ actor: sourceId });
  return sourceClient.disablePrettyPrint();
}

function interrupt(): Promise<*> {
  return threadClient.interrupt();
}

function eventListeners(): Promise<*> {
  return threadClient.eventListeners();
}

function pauseGrip(func: Function): ObjectClient {
  return threadClient.pauseGrip(func);
}

async function fetchSources() {
  const { sources } = await threadClient.getSources();
  return sources.map(createSource);
}

const clientCommands = {
  blackBox,
  interrupt,
  eventListeners,
  pauseGrip,
  resume,
  stepIn,
  stepOut,
  stepOver,
  breakOnNext,
  sourceContents,
  setBreakpoint,
  removeBreakpoint,
  setBreakpointCondition,
  evaluate,
  debuggeeCommand,
  navigate,
  reload,
  getProperties,
  pauseOnExceptions,
  prettyPrint,
  disablePrettyPrint,
  fetchSources
};

module.exports = {
  setupCommands,
  clientCommands
};
