"use strict";

const React = require("react");
const { DOM: dom, createElement } = React;
const { storiesOf } = require("@kadira/storybook");
const configureStore = require("../../create-store");
const { combineReducers } = require("redux");
const reducers = require("../../reducers");
const { Provider } = require("react-redux");
const { fromJS } = require("immutable");

const Breakpoints = React.createFactory(require("../Breakpoints"));
const fixtures = require("../../test/fixtures.json");

storiesOf("Breakpoints", module)
  .add("No Breakpoints", () => {
    const store = configureStore({})(combineReducers(reducers), {
      sources: fromJS({
        sources: {}
      }),
      breakpoints: fromJS({
        breakpoints: {}
      })
    });
    return renderBreakpoints(store);
  })
  .add("1 Domain", () => {
    const store = configureStore({})(combineReducers(reducers), {
      sources: fromJS({
        sources: {
          "fooSourceActor": fixtures.sources.sources.fooSourceActor,
        }
      }),
      breakpoints: fromJS({
        breakpoints: {
          "fooBreakpointActor": fixtures.breakpoints.fooBreakpointActor,
        }
      })
    });
    return renderBreakpoints(store);
  })
  .add("2 Domains", () => {
    const store = configureStore({})(combineReducers(reducers), {
      sources: fromJS({
        sources: {
          "fooSourceActor": fixtures.sources.sources.fooSourceActor,
          "barSourceActor": fixtures.sources.sources.barSourceActor,
        }
      }),
      breakpoints: fromJS({
        breakpoints: {
          "fooBreakpointActor": fixtures.breakpoints.fooBreakpointActor,
          "barBreakpointActor": fixtures.breakpoints.barBreakpointActor,
        }
      })
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
