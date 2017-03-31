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
const { teardownWorkers } = require("./utils/teardown");

if (!isFirefoxPanel()) {
  window.L10N = L10N;
  // $FlowIgnore:
  window.L10N.setBundle(require("../assets/panel/debugger.properties"));
}

if (isFirefoxPanel()) {
  module.exports = {
    bootstrap: ({ threadClient, tabTarget, debuggerClient }: any) => {
      return onConnect({
        tab: { clientType: "firefox" },
        tabConnection: {
          tabTarget,
          threadClient,
          debuggerClient,
        },
      });
    },
    destroy: () => {
      unmountRoot(ReactDOM);
      teardownWorkers();
    },
  };
} else {
  bootstrap(React, ReactDOM).then(onConnect);
}
