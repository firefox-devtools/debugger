"use strict";

const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { Map, fromJS } = require("immutable");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");
const Frames = React.createFactory(require("../Frames"));
const fixtures = require("../../test/fixtures");

function getData(fixtureName) {
  const fixture = fixtures[fixtureName];
  const frames = fixture.pause.frames;
  return {
    pause: Map({ frames }),
    sources: fromJS({ sources: fixture.sources.sources })
  };
}

storiesOf("Frames", module)
  .add("Blank", () => {
    return renderContainer(Frames);
  })
  .add("TodoMVC Todo Toggle", () => {
    return renderContainer(Frames, getData("todomvcToggle"));
  })
  .add("Nested Closures", () => {
    return renderContainer(Frames, getData("pythagorean"));
  });

function renderContainer(Component, data) {
  const store = createStore(data);
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
