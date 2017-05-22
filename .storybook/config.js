import { configure, getStorybook } from "@kadira/storybook";
const { setConfig } = require("devtools-config");

setConfig(DebuggerConfig);

function loadStories() {
  require("../src/components/stories/tabs.js");
  require("../src/components/stories/frames.js");
  require("../src/components/stories/Preview.js");
}

configure(loadStories, module);

if (typeof window === "object") {
  window.__storybook_stories__ = getStorybook();
}
