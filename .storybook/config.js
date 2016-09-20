const { configure } = require("@kadira/storybook");
const { setConfig } = require("../config/feature");

require("../public/js/lib/themes/light-theme.css");
setConfig(DebuggerConfig);

function loadStories() {
  require("../public/js/components/stories");
}

configure(loadStories, module);
