"use strict";

const {
  WebSocketConnection,
  InspectorBackend
} = require("./chrome/api");

const { Tab, Source, Location, Frame } = require("../types");

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
    return debuggerAgent.setBreakpoint({
      scriptId: location.sourceId,
      lineNumber: location.line - 1,
      columnNumber: location.column
    }, (_, breakpointId, actualLocation) => ([
      {},
      {
        id: breakpointId,
        remove: () => {
          // TODO: resolve promise when request is completed.
          return new Promise((resolve, reject) => {
            resolve(debuggerAgent.removeBreakpoint(breakpointId));
          });
        },
        setCondition: () => {},
      }
    ]));
  }
};

function getAPIClient() {
  return APIClient;
}

// Connection handling

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

function chromeTabs(callback) {
  fetch("/chrome-tabs").then(res => {
    res.json().then((body) => {
      callback(createTabs(body));
    });
  });
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
      actions.newSource(Source({ id: scriptId, url }));
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
    }
  };
}

function initPage(actions) {
  const conn = connection;
  const ws = conn._socket;
  debuggerAgent = conn._agents.Debugger;
  runtimeAgent = conn._agents.Runtime;
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
  chromeTabs,
  getAPIClient,
  connectTab,
  initPage
};
