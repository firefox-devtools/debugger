"use strict";

const { configure } = require("@kadira/storybook");
require("../build/styles.css");

function loadStories() {
  require("../public/js/components/stories");
}

configure(loadStories, module);
