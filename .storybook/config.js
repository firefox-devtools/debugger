const { configure } = require("@kadira/storybook");
const { setConfig } = require("../config/feature");

require("../src/lib/themes/light-theme.css");
setConfig(DebuggerConfig);

function loadStories() {
  require("../src/components/stories");
}

configure(loadStories, module);
