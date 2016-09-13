const { BreakpointResult, Location } = require("../../types");
const defer = require("../../utils/defer");
const { getOriginalLocation, getGeneratedLocation } = require("../../utils/source-map");

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

async function setBreakpoint(location, condition, state : AppState) {
  const sourceClient = threadClient.source({ actor: location.sourceId });

  const [res, bpClient] = await sourceClient.setBreakpoint({
    line: location.line,
    column: location.column,
    condition: condition
  });

  bpClients[bpClient.actor] = bpClient;

  let actualLocation = res.actualLocation ? {
    sourceId: res.actualLocation.source.actor,
    line: res.actualLocation.line,
    column: res.actualLocation.column
  } : location;

  actualLocation = await getOriginalLocation(state, location);

  return BreakpointResult({
    id: bpClient.actor,
    actualLocation: Location(actualLocation)
  });
}

function removeBreakpoint(breakpointId) {
  // FIXME : problem disabling/enabling and disabling again => bpClient become null \o/
  // Possibly when re-enabling the breakpoint, it has another actor
  const bpClient = bpClients[breakpointId];
  delete bpClients[breakpointId];
  return bpClient.remove();
}

async function toggleAllBreakpoints(shouldDisableBreakpoints, breakpoints, state : AppState) {
  for (let [, breakpoint] of breakpoints) {
    if (shouldDisableBreakpoints) {
      // FIXME : problem when disabling breakpoints, enabling them and disabling them again
      await removeBreakpoint(breakpoint.id);
    } else {
      await setBreakpoint(breakpoint.location, breakpoint.condition, state);
    }
  }
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
