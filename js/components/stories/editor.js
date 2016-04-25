"use strict";

const React = require("react");
const { DOM: dom } = React;
// const Accordion = React.createFactory(require("../Accordion"));
const { storiesOf } = require("@kadira/storybook");

storiesOf("Editor", module)
  .add("Loading", () => {})
  .add("Loaded Source", () => {})
  .add("With a breakpoint", () => {});
