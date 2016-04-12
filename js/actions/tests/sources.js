"use strict";

const { createStore, actions, queries } = require("../../util/test-head");
const store = createStore();

function run_test() {
  store.dispatch(actions.newSource({
    url: "http://example.com/foo1.js",
    actor: "foo1"
  }));
  store.dispatch(actions.newSource({
    url: "http://example.com/foo2.js",
    actor: "foo2"
  }));

  equal(queries.getSourceCount(store.getState()), 2);
  const foo1 = queries.getSourceByURL(store.getState(),
                                      "http://example.com/foo1.js");
  const foo2 = queries.getSourceByURL(store.getState(),
                                      "http://example.com/foo2.js");
  ok(foo1, "foo1 exists");
  equal(foo1.actor, "foo1");
  ok(foo2, "foo2 exists");
  equal(foo2.actor, "foo2");
}
