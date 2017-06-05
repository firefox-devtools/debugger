import { configure, getStorybook } from "@kadira/storybook";
const { setConfig } = require("devtools-config");

setConfig(DebuggerConfig);

function loadStories() {
  require("../src/components/stories/tabs.js");
  require("../src/components/stories/frames.js");
  require("../src/components/stories/Preview.js");
  require("../src/components/stories/Outline.js");
  require("../src/components/stories/SearchInput.js");
  require("../src/components/stories/ResultList.js");
  require("../src/components/stories/ManagedTree.js");
  require("../src/components/stories/TextSearch.js");
}

configure(loadStories, module);

if (typeof window === "object") {
  window.__storybook_stories__ = getStorybook();
}
