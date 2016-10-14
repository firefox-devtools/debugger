const { BreakpointResult, Location } = require("../../types");
const defer = require("../../utils/defer");

let bpClients;
let threadClient;
let tabTarget;
let debuggerClient;

function setupCommands(dependencies) {
  threadClient = dependencies.threadClient;
  tabTarget = dependencies.tabTarget;
  debuggerClient = dependencies.debuggerClient;
  bpClients = {};
}

function resume() {
  return new Promise(resolve => {
    threadClient.resume(resolve);
  });
}

function stepIn() {
  return new Promise(resolve => {
    threadClient.stepIn(resolve);
  });
}

function stepOver() {
  return new Promise(resolve => {
    threadClient.stepOver(resolve);
  });
}

function stepOut() {
  return new Promise(resolve => {
    threadClient.stepOut(resolve);
  });
}

function breakOnNext() {
  return threadClient.breakOnNext();
}

function sourceContents(sourceId) {
  const sourceClient = threadClient.source({ actor: sourceId });
  return sourceClient.source();
}

function setBreakpoint(location, condition, noSliding) {
  const sourceClient = threadClient.source({ actor: location.sourceId });

  return sourceClient.setBreakpoint({
    line: location.line,
    column: location.column,
    condition,
    noSliding
  }).then(([res, bpClient]) => {
    bpClients[bpClient.actor] = bpClient;

    // Firefox only returns `actualLocation` if it actually changed,
    // but we want it always to exist. Format `actualLocation` if it
    // exists, otherwise use `location`.
    const actualLocation = res.actualLocation ? {
      sourceId: res.actualLocation.source.actor,
      line: res.actualLocation.line,
      column: res.actualLocation.column
    } : location;

    return BreakpointResult({
      id: bpClient.actor,
      actualLocation: Location(actualLocation)
    });
  });
}

function removeBreakpoint(breakpointId) {
  const bpClient = bpClients[breakpointId];
  bpClients[breakpointId] = null;
  return bpClient.remove();
}

let lastDisabledBreakpoints = [];

async function toggleAllBreakpoints(shouldDisableBreakpoints) {
  if (shouldDisableBreakpoints) {
    for (let id of Object.keys(bpClients)) {
      const bp = bpClients[id];
      if (bp) {
        await removeBreakpoint(bp.actor);

        const bpResult = BreakpointResult({
          id: bp.actor,
          actualLocation: Location({
            sourceId: bp.location.actor,
            line: bp.location.line,
            column: bp.location.column
          })
        });

        lastDisabledBreakpoints.push(bpResult);
      }
    }

    return lastDisabledBreakpoints;
  }

  for (let bp of lastDisabledBreakpoints) {
    await setBreakpoint(bp.actualLocation, bp.condition);
  }

  const changed = lastDisabledBreakpoints;

  lastDisabledBreakpoints = [];
  return changed;
}

function evaluate(script) {
  const deferred = defer();
  tabTarget.activeConsole.evaluateJS(script, (result) => {
    deferred.resolve(result);
  });

  return deferred.promise;
}

function debuggeeCommand(script) {
  tabTarget.activeConsole.evaluateJS(script, () => {});

  const consoleActor = tabTarget.form.consoleActor;
  const request = debuggerClient._activeRequests.get(consoleActor);
  request.emit("json-reply", {});
  debuggerClient._activeRequests.delete(consoleActor);

  return Promise.resolve();
}

function navigate(url) {
  return tabTarget.activeTab.navigateTo(url);
}

function reload() {
  return tabTarget.activeTab.reload();
}

function getProperties(grip) {
  const objClient = threadClient.pauseGrip(grip);
  return objClient.getPrototypeAndProperties();
}

function pauseOnExceptions(
  shouldPauseOnExceptions, shouldIgnoreCaughtExceptions) {
  return threadClient.pauseOnExceptions(
    shouldPauseOnExceptions,
    shouldIgnoreCaughtExceptions
  );
}

function prettyPrint(sourceId, indentSize) {
  const sourceClient = threadClient.source({ actor: sourceId });
  return sourceClient.prettyPrint(indentSize);
}

function disablePrettyPrint(sourceId) {
  const sourceClient = threadClient.source({ actor: sourceId });
  return sourceClient.disablePrettyPrint();
}

const clientCommands = {
  resume,
  stepIn,
  stepOut,
  stepOver,
  breakOnNext,
  sourceContents,
  setBreakpoint,
  removeBreakpoint,
  toggleAllBreakpoints,
  evaluate,
  debuggeeCommand,
  navigate,
  reload,
  getProperties,
  pauseOnExceptions,
  prettyPrint,
  disablePrettyPrint
};

module.exports = {
  setupCommands,
  clientCommands
};
