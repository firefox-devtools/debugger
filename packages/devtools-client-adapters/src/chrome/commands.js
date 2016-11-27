const { BreakpointResult, Location } = require("../tcomb-types");

let debuggerAgent;
let runtimeAgent;
let pageAgent;

function setupCommands({ Debugger, Runtime, Page }) {
  debuggerAgent = Debugger;
  runtimeAgent = Runtime;
  pageAgent = Page;
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
  return debuggerAgent.getScriptSource({ scriptId: sourceId })
    .then(({ scriptSource }) => ({
      source: scriptSource,
      contentType: null
    }));
}

function setBreakpoint(location, condition) {
  return debuggerAgent.setBreakpoint({
    location: {
      scriptId: location.sourceId,
      lineNumber: location.line - 1
    },
    columnNumber: location.column
  }).then(({ breakpointId, actualLocation }) => {
    actualLocation = actualLocation ? {
      sourceId: actualLocation.scriptId,
      line: actualLocation.lineNumber + 1,
      column: actualLocation.columnNumber
    } : location;

    return BreakpointResult({
      id: breakpointId,
      actualLocation: Location(actualLocation)
    });
  });
}

function removeBreakpoint(breakpointId) {
  return debuggerAgent.removeBreakpoint({ breakpointId });
}

function evaluate(script) {
  return runtimeAgent.evaluate({ expression: script });
}

function debuggeeCommand(script) {
  evaluate(script);
  return Promise.resolve();
}

function navigate(url) {
  return pageAgent.navigate({ url });
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
