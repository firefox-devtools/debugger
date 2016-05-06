"use strict";
const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS } = require("immutable");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");

const Sources = React.createFactory(require("../Sources"));
const fixtures = require("../../test/fixtures");

function sourceData(fixture) {
  return fixtures[fixture].sources.sources;
}

storiesOf("Sources", module)
  .add("Same Domain", () => {
    const store = createStore({
    });
    const foobar = fixtures.foobar;
    const fooSourceActor = foobar.sources.sources.fooSourceActor;
    const barSourceActor = foobar.sources.sources.barSourceActor;
    const props = {
      sources: fromJS({ fooSourceActor, barSourceActor })
    };

    return renderContainer(store, Sources, props);
  })
  .add("TodoMVC", () => {
    const sources = sourceData("todomvcUpdateOnEnter");
    const store = createStore({
      sources: fromJS({ selectedSource: sources["server1.conn8.child2/42"] })
    });

    const props = {
      sources: fromJS(sources)
    };

    return renderContainer(store, Sources, props);
  });

function renderContainer(store, Component, props) {
  return dom.div({ style: {
    overflowX: "hidden",
    width: "300px",
    margin: "auto",
    paddingTop: "100px" }},
    dom.div({ style: { border: "1px solid #ccc" }},
      createElement(Provider, { store }, Component(props))
    )
  );
}
