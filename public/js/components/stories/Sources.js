"use strict";
const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS } = require("immutable");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");

const Sources = React.createFactory(require("../Sources"));
const fixtures = require("../../test/fixtures.json");

const fooSourceActor = fixtures.sources.sources.fooSourceActor;
const barSourceActor = fixtures.sources.sources.barSourceActor;

storiesOf("Sources", module)
  .add("Same Domain", () => {
    const store = createStore({
    });
    const props = {
      sources: fromJS({ fooSourceActor, barSourceActor })
    };

    return renderContainer(store, Sources, props);
  });

function renderContainer(store, Component, props) {
  return dom.div({ style: {
    width: "300px",
    margin: "auto",
    paddingTop: "100px" }},
    dom.div({ style: { border: "1px solid #ccc", padding: "20px" }},
      createElement(Provider, { store }, Component(props))
    )
  );
}
