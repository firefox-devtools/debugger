"use strict";

const {
  WebSocketConnection,
  InspectorBackend
} = require("./chrome/api");

const { Tab, Source, Location, BreakpointResult, Frame } = require("../types");
const { isEnabled } = require("../configs/feature");
const defer = require("../util/defer");

/* eslint-disable */
// TODO: figure out a way to avoid patching native prototypes.
// Unfortunately the Chrome client requires it to work.
Array.prototype.peekLast = function() {
  return this[this.length - 1];
};
/* eslint-enable */

const bootstrap = require("./chrome/bootstrap");

let connection;
let debuggerAgent;
let runtimeAgent;
let pageAgent;

// API implementation

let APIClient = {
  resume() {
    return debuggerAgent.resume();
  },

  stepIn() {
    return debuggerAgent.stepInto();
  },

  stepOver() {
    return debuggerAgent.stepOver();
  },

  stepOut() {
    return debuggerAgent.stepOut();
  },

  sourceContents(sourceId) {
    return debuggerAgent.getScriptSource(sourceId, (_, contents) => ({
      source: contents,
      contentType: null
    }));
  },

  setBreakpoint(location, condition) {
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
    })
  },

  removeBreakpoint(breakpointId) {
    // TODO: resolve promise when request is completed.
    return new Promise((resolve, reject) => {
      resolve(debuggerAgent.removeBreakpoint(breakpointId));
    });
  },

  evaluate(script) {
    return runtimeAgent.evaluate(script, (_, result) => {
      console.log("console.evalute", result);
      return result;
    });
  },

  navigate(url) {
    return pageAgent.navigate(url, (_, result) => {
      console.log("page.navigate", result);
      return result;
    });
  }
};

function getAPIClient() {
  return APIClient;
}

function createTabs(tabs) {
  const blacklist = ["New Tab", "Inspectable pages"];

  return tabs
    .filter(tab => {
      const isPage = tab.type == "page";
      const isBlacklisted = blacklist.indexOf(tab.title) != -1;

      return isPage && !isBlacklisted;
    })
    .map(tab => {
      return Tab({
        title: tab.title,
        url: tab.url,
        id: tab.id,
        tab,
        browser: "chrome"
      });
    });
}

function connectClient() {
  if (!isEnabled("chrome.debug")) {
    return Promise.resolve([]);
  }

  const deferred = defer();
  fetch("/chrome-tabs").then(res => {
    res.json().then((body) => {
      deferred.resolve(createTabs(body));
    });
  });

  return deferred.promise;
}

function connectTab(tab) {
  return new Promise(resolve => {
    bootstrap(InspectorBackend);
    WebSocketConnection.Create(
      tab.webSocketDebuggerUrl,
      conn => {
        connection = conn;
        resolve();
      }
    );
  });
}

function makeDispatcher(actions) {
  return {
    scriptParsed(scriptId, url, startLine, startColumn,
                 endLine, endColumn, executionContextId, hash,
                 isContentScript, isInternalScript, isLiveEdit,
                 sourceMapURL, hasSourceURL, deprecatedCommentWasUsed) {
      actions.newSource(Source({ id: scriptId, url: url }));
    },

    scriptFailedToParse() {
    },

    paused(callFrames, reason, data, hitBreakpoints, asyncStackTrace) {
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
    },

    resumed: function() {
      actions.resumed();
    },

    globalObjectCleared: function() {
    }
  };
}

function initPage(actions) {
  const conn = connection;
  const ws = conn._socket;
  debuggerAgent = conn._agents.Debugger;
  runtimeAgent = conn._agents.Runtime;
  pageAgent = conn._agents.Page;

  ws.onopen = function() {
  };

  ws.onmessage = function(e) {
    conn._onMessage(e);
  };

  conn.registerDispatcher("Debugger", makeDispatcher(actions));

  debuggerAgent.enable();
  debuggerAgent.setPauseOnExceptions("none");
  debuggerAgent.setAsyncCallStackDepth(0);

  runtimeAgent.enable();
  runtimeAgent.run();
}

module.exports = {
  connectClient,
  getAPIClient,
  connectTab,
  initPage
};
