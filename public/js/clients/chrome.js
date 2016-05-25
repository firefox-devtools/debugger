"use strict";

const {
  WebSocketConnection,
  InspectorBackend
} = require("./chrome/api");

const bootstrap = require("./chrome/bootstrap");

let connectionAgents;

function getAgent(name) {
  return connectionAgents[name];
}

function presentTabs(tabs) {
  const blacklist = ["New Tab", "Inspectable pages"];

  return tabs
    .filter(tab => {
      const isPage = tab.type == "page";
      const isBlacklisted = blacklist.indexOf(tab.title) != -1;

      return isPage && !isBlacklisted;
    })
    .map(tab => {
      return {
        title: tab.title,
        url: tab.url,
        id: tab.id,
        tab,
        browser: "chrome"
      };
    });
}

function chromeTabs(callback) {
  fetch("/chrome-tabs").then(res => {
    res.json().then((body) => {
      callback(presentTabs(body));
    });
  });
}

const SourceClient = function (source) {
  const debuggerAgent = getAgent("Debugger");

  return {
    source() {
      return debuggerAgent.getScriptSource(source.id, (_, contents) => ({
        source: contents,
        contentType: null
      }));
    },

    setBreakpoint({ line, column, condition }) {
      return debuggerAgent.setBreakpoint({
        scriptId: source.id,
        lineNumber: line,
        columnNumber: column
      }, (_, breakpointId, actualLocation) => ([
        {},
        {
          id: breakpointId,
          remove: () => {
            // TODO: resolve promise when request is completed.
            return new Promise((resolve, reject) => {
              resolve(debuggerAgent.removeBreakpoint(breakpointId));
            })
          },
          setCondition: () => {},
        }
      ]));
    }
  }
}

const ThreadClient = {
  source: SourceClient,

  resume() {
    const debuggerAgent = getAgent("Debugger");
    return debuggerAgent.resume();
  },

  stepIn() {
    const debuggerAgent = getAgent("Debugger");
    return debuggerAgent.stepInto();
  },

  stepOver() {
    const debuggerAgent = getAgent("Debugger");
    return debuggerAgent.stepOver();
  },

  stepOut() {
    const debuggerAgent = getAgent("Debugger");
    return debuggerAgent.stepOut();
  }
};

const debuggerDispatcher = actions => ({
  scriptParsed: function(scriptId, url, startLine, startColumn,
                         endLine, endColumn, executionContextId, hash,
                         isContentScript, isInternalScript, isLiveEdit,
                         sourceMapURL, hasSourceURL, deprecatedCommentWasUsed) {
    let packet = {scriptId, url, startLine, startColumn,
                           endLine, endColumn, executionContextId, hash,
                           isContentScript, isInternalScript, isLiveEdit,
                           sourceMapURL, hasSourceURL, deprecatedCommentWasUsed}

    const source = {id: scriptId, url};
    actions.newSource(source);
  },

  scriptFailedToParse: function() {
    // needed for debugging nytimes
    console.log("SCRIPT FAILED TO PARSED", arguments);
  },

  paused: function(callFrames, reason, data, hitBreakpoints, asyncStackTrace) {
    const frames = callFrames.map(frame => {
      return {
        id: frame.callFrameId,
        displayName: frame.functionName,
        location: {
          sourceId: frame.functionLocation.scriptId,
          line: frame.functionLocation.lineNumber + 1,
          column: frame.functionLocation.columnNumber
        }
      }
    });

    const frame = frames[0];

    // do we use why or reason/data (no strong opinions)
    const why = {
      type: reason,
      ...data
    };

    actions.paused({
      pause: { frame, why },
      frames
    });
  },

  resumed: function() {
    actions.resumed();
  }
});


function onConnection(connection, actions) {
  const ws = connection._socket;
  connectionAgents = connection._agents;
  ws.onopen = function() {
  };
  ws.onmessage = function(e) {
    connection._onMessage(e)
  };

  connection.registerDispatcher("Debugger", debuggerDispatcher(actions));
  const debuggerAgent = getAgent("Debugger");
  debuggerAgent.enable();
  debuggerAgent.setPauseOnExceptions("none");
  debuggerAgent.setAsyncCallStackDepth(0);

  const runtimeAgent = getAgent("Runtime");
  runtimeAgent.enable();
  runtimeAgent.run();
}

function debugChromeTab(tab, actions) {
  bootstrap(InspectorBackend);
  WebSocketConnection.Create(
    tab.webSocketDebuggerUrl,
    conn => onConnection(conn, actions)
  );
  return Promise.resolve();
}

module.exports = {
  chromeTabs,
  debugChromeTab,
  getAgent,
  ThreadClient
};
