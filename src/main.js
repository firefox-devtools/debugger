// @flow

const React = require("react");
const ReactDOM = require("react-dom");

const {
  bootstrap,
  L10N,
  unmountRoot,
} = require("devtools-launchpad");
const { isFirefoxPanel } = require("devtools-config");

const { onConnect } = require("./client");
const { teardownWorkers } = require("./utils/bootstrap");

if (isFirefoxPanel()) {
  module.exports = {
    bootstrap: (
      { threadClient, tabTarget, debuggerClient, sourceMaps }: any
    ) => {
      return onConnect(
        {
          tab: { clientType: "firefox" },
          tabConnection: {
            tabTarget,
            threadClient,
            debuggerClient,
          },
        },
        {
          sourceMaps,
        }
      );
    },
    destroy: () => {
      unmountRoot(ReactDOM);
      teardownWorkers();
    },
  };
} else {
  window.L10N = L10N;
  // $FlowIgnore:
  window.L10N.setBundle(require("../assets/panel/debugger.properties"));

  bootstrap(React, ReactDOM).then(connection => {
    onConnect(connection, {
      sourceMaps: require("devtools-source-map"),
    });
  });
}
