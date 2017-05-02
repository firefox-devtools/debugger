import { configure } from "@kadira/storybook";
const { setConfig } = require("devtools-config");

setConfig(DebuggerConfig);
function loadStories() {
  require("../src/components/stories/tabs.js");
}

configure(loadStories, module);
