import { configure } from "@kadira/storybook";
const { setConfig } = require("devtools-config");

if (process.argv[1] && process.argv[1].match(/percy-storybook/)) {
  setConfig({});
  require("./percy-stub");
} else {
  setConfig(DebuggerConfig);
}

function loadStories() {
  require("../src/components/stories/tabs.js");
}

configure(loadStories, module);
