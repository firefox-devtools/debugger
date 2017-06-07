// @flow
import _ from "lodash";

import type {
  BreakpointId,
  BreakpointResult,
  Frame,
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

function getBreakpointByLocation(location: Location) {
  const values = _.values(bpClients);
  const bpClient = values.find(value => {
    const { actor, line, column, condition } = value.location;
    return (
      location.line === line &&
      location.sourceId === actor &&
      location.column === column &&
      location.condition === condition
    );
  });

  if (bpClient) {
    const { actor, url, line, column, condition } = bpClient.location;
    return {
      id: bpClient.actor,
      actualLocation: {
        line,
        column,
        condition,
        sourceId: actor,
        sourceUrl: url
      }
    };
  }
  return null;
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
  try {
    const bpClient = bpClients[breakpointId];
    delete bpClients[breakpointId];
    return bpClient.remove();
  } catch (_error) {
    console.warn("No breakpoint to delete on server");
  }
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

async function getFrameScopes(frame: Frame): Promise<*> {
  if (frame.scope) {
    return frame.scope;
  }

  return threadClient.getEnvironment(frame.id);
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
  getBreakpointByLocation,
  setBreakpoint,
  removeBreakpoint,
  setBreakpointCondition,
  evaluate,
  debuggeeCommand,
  navigate,
  reload,
  getProperties,
  getFrameScopes,
  pauseOnExceptions,
  prettyPrint,
  disablePrettyPrint,
  fetchSources
};

module.exports = {
  setupCommands,
  clientCommands
};
