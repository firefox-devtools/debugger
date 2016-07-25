const { constants, selectors, createStore } = require("../../utils/test-head");
const { getSourceById } = selectors;
const expect = require("expect.js");

const fixtures = require("../../test/fixtures/todoSources.json");
const fakeSources = fixtures.sources;

// Write our own `newSource` to bypass the batching logic.
function newSource(source) {
  return {
    type: constants.ADD_SOURCE,
    source: source
  };
}

// "prepopulate" various stores here
let store = createStore();
store.dispatch(newSource(fakeSources["backbone.js"]));
store.dispatch(newSource(fakeSources["todo.js"]));
store.dispatch(newSource(fakeSources["jquery.js"]));
const stateWith3Sources = store.getState();

store = createStore();
store.dispatch(newSource(fakeSources["jquery.js"]));
store.dispatch(addBreakpoint({ sourceId: "jquery.js", line: 3 }));
const stateWith1SourceAndBreakpoint = store.getState();
// etc etc...


describe("newSource", () => {
  it("adding two sources", () => {
    const { dispatch, getState } = createStore();
    dispatch(newSource(fakeSources["base.js"]));
    dispatch(newSource(fakeSources["jquery.js"]));

    const base = getSourceById(getState(), "base.js");
    const jquery = getSourceById(getState(), "jquery.js");
    expect(base.get("id")).to.equal("base.js");
    expect(jquery.get("id")).to.equal("jquery.js");
  });

  it("select source", () => {
    // mockClient to be defined
    const { dispatch, getState } = createStore(mockClient, stateWith3Sources);
    dispatch(selectSource("base.js"));
    // do some assertion here...
  });
});
