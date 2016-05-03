"use strict";
const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS } = require("immutable");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");
const Scopes = React.createFactory(require("../Scopes"));

const backbonePauseOnEnter =
  require("../../test/fixtures/backbone.pause.onEnter.json");

storiesOf("Scopes", module)
  .add("Not Paused", () => {
    const store = createStore();
    return renderContainer(store, Scopes);
  })
  .add("Event Handler", () => {
    const store = createStore({ pause: fromJS({ pause: backbonePauseOnEnter })});
    return renderContainer(store, Scopes);
  });

function renderContainer(store, Component) {
  return dom.div({style: {
    width: "300px",
    margin: "auto",
    paddingTop: "100px" }},
    dom.div({style: {border: "1px solid #ccc", padding: "20px" }},
      createElement(Provider, { store }, Component())
    )
  );
}
