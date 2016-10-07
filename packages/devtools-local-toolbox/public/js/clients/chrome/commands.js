const { BreakpointResult, Location } = require("../../types");

let debuggerAgent;
let runtimeAgent;
let pageAgent;

function setupCommands({ agents }) {
  debuggerAgent = agents.Debugger;
  runtimeAgent = agents.Runtime;
  pageAgent = agents.Page;
}

function resume() {
  return debuggerAgent.resume();
}

function stepIn() {
  return debuggerAgent.stepInto();
}

function stepOver() {
  return debuggerAgent.stepOver();
}

function stepOut() {
  return debuggerAgent.stepOut();
}

function pauseOnExceptions(toggle) {
  const state = toggle ? "uncaught" : "none";
  return debuggerAgent.setPauseOnExceptions(state);
}

function breakOnNext() {
  return debuggerAgent.pause();
}

function sourceContents(sourceId) {
  return debuggerAgent.getScriptSource(sourceId, (err, contents) => ({
    source: contents,
    contentType: null
  }));
}

function setBreakpoint(location, condition) {
  return new Promise((resolve, reject) => {
    return debuggerAgent.setBreakpoint({
      scriptId: location.sourceId,
      lineNumber: location.line - 1,
      columnNumber: location.column
    }, (err, breakpointId, actualLocation) => {
      if (err) {
        reject(err);
        return;
      }

      actualLocation = actualLocation ? {
        sourceId: actualLocation.scriptId,
        line: actualLocation.lineNumber + 1,
        column: actualLocation.columnNumber
      } : location;

      resolve(BreakpointResult({
        id: breakpointId,
        actualLocation: Location(actualLocation)
      }));
    });
  });
}

function removeBreakpoint(breakpointId) {
  // TODO: resolve promise when request is completed.
  return new Promise((resolve, reject) => {
    resolve(debuggerAgent.removeBreakpoint(breakpointId));
  });
}

function evaluate(script) {
  return runtimeAgent.evaluate(script, (_, result) => {
    return result;
  });
}

function debuggeeCommand(script) {
  evaluate(script);
  return Promise.resolve();
}

function navigate(url) {
  return pageAgent.navigate(url, (_, result) => {
    return result;
  });
}

const clientCommands = {
  resume,
  stepIn,
  stepOut,
  stepOver,
  pauseOnExceptions,
  breakOnNext,
  sourceContents,
  setBreakpoint,
  removeBreakpoint,
  evaluate,
  debuggeeCommand,
  navigate
};

module.exports = {
  setupCommands,
  clientCommands
};
