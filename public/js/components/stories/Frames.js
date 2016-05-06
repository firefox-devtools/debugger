"use strict";

const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { Map } = require("immutable");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");
const Frames = React.createFactory(require("../Frames"));
const fixtures = require("../../test/fixtures");

function frameData(fixture) {
  return fixtures[fixture].pause.frames;
}

storiesOf("Frames", module)
  .add("Blank", () => {
    return renderContainer(Frames);
  })
  .add("TodoMVC Todo Toggle", () => {
    return renderContainer(Frames, fixtures.frames);
  })
  .add("Nested Closures", () => {
    return renderContainer(Frames, frameData("pythagorean"));
  });

function renderContainer(Component, frames) {
  const store = createStore({ pause: Map({ frames }) });
  return dom.div(
    { style: {
      width: "400px",
      margin: "auto",
      paddingTop: "100px"
    }},
    createElement(Provider, { store },
      dom.div({ className: "accordion" },
        dom.div({ className: "_content" }, createElement(Component))))
  );
}
