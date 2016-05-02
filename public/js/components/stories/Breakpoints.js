"use strict";

const React = require("react");
const { DOM: dom, createElement } = React;
const { storiesOf } = require("@kadira/storybook");
const { Provider } = require("react-redux");
const { createStore } = require("./utils");

const Breakpoints = React.createFactory(require("../Breakpoints"));
const fixtures = require("../../test/fixtures.json");

const fooSourceActor = fixtures.sources.sources.fooSourceActor;
const barSourceActor = fixtures.sources.sources.barSourceActor;
const fooBreakpointActor = fixtures.breakpoints.fooBreakpointActor;
const barBreakpointActor = fixtures.breakpoints.barBreakpointActor;

storiesOf("Breakpoints", module)
  .add("No Breakpoints", () => {
    const store = createStore();
    return renderBreakpoints(store);
  })
  .add("1 Domain", () => {
    const store = createStore({
      sources: { fooSourceActor },
      breakpoints: { fooBreakpointActor }
    });
    return renderBreakpoints(store);
  })
  .add("2 Domains", () => {
    const store = createStore({
      sources: { fooSourceActor, barSourceActor },
      breakpoints: { fooBreakpointActor, barBreakpointActor }
    });
    return renderBreakpoints(store);
  });

function renderBreakpoints(store) {
  return dom.div({style: {
    width: "300px",
    margin: "auto",
    paddingTop: "100px" }},
    dom.div({style: {border: "1px solid #ccc", padding: "20px" }},
      createElement(Provider, { store }, Breakpoints())
    )
  );
}
