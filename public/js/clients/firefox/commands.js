"use strict";

const { BreakpointResult, Location } = require("../../types");
const defer = require("../../lib/devtools/shared/defer");

let bpClients;
let threadClient;
let tabTarget;

function setupCommands(dependencies) {
  threadClient = dependencies.threadClient;
  tabTarget = dependencies.tabTarget;
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

function setBreakpoint(location, condition) {
  const sourceClient = threadClient.source({ actor: location.sourceId });
  return sourceClient.setBreakpoint({
    line: location.line,
    column: location.column,
    condition: condition
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

function evaluate(script) {
  const deferred = defer();

  tabTarget.activeConsole.evaluateJS(script, (result) => {
    deferred.resolve(result);
  });

  return deferred.promise;
}

function navigate(url) {
  return tabTarget.activeTab.navigateTo(url);
}

function getProperties(grip) {
  const objClient = threadClient.pauseGrip(grip);
  return objClient.getPrototypeAndProperties();
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
  evaluate,
  navigate,
  getProperties,
  prettyPrint,
  disablePrettyPrint
};

module.exports = {
  setupCommands,
  clientCommands
};
