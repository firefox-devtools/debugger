"use strict";
const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS } = require("immutable");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");
const Scopes = React.createFactory(require("../Scopes"));

const fixtures = require("../../test/fixtures");

function getData(fixture) {
  return fixtures[fixture];
}

storiesOf("Scopes", module)
  .add("Not Paused", () => {
    const store = createStore();
    return renderContainer(store, Scopes);
  })
  .add("TodoMVC Event Handler", () => {
    const data = getData("todomvcUpdateOnEnter");
    const store = createStore({
      pause: fromJS({
        pause: data.pause.pause,
        loadedObjects: data.pause.loadedObjects
      })
    });
    return renderContainer(store, Scopes);
  })
  .add("Nested Closures", () => {
    const data = getData("pythagorean");
    const store = createStore({
      pause: fromJS({
        pause: data.pause.pause,
        loadedObjects: data.pause.loadedObjects
      })
    });
    return renderContainer(store, Scopes);
  });

function renderContainer(store, Component) {
  return dom.div({ style: {
    width: "300px",
    margin: "auto",
    paddingTop: "100px" }},
    createElement(
      Provider,
      { store },
      dom.div({ className: "accordion" },
        dom.div({ className: "_content" }, createElement(Component)))
    )
  );
}
