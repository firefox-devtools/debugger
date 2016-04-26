"use strict";

const { actions, queries, createStore } = require("../../util/test-head");
const { getSelectedSource } = queries;
const { selectSource } = actions;

const { fromJS } = require("immutable");

const expect = require("expect.js");

const simpleMockThreadClient = {
  source: function(form) {
    return {
      source: () => {
        return new Promise((resolve, reject) => {
          resolve(sourcesFixtures.sources[form.actor]);
        });
      }
    };
  }
};

const sourcesFixtures = {
  sources: {
    "fooSourceActor": {
      actor: "fooSourceActor",
      url: "http://example.com/foo.js"
    },
    "barSourceActor": {
      actor: "barSourceActor",
      url: "http://example.com/bar.js"
    }
  },
  sourcesText: {
    "fooSourceActor": {
      contentType: "text/javascript",
      text: "function() {\n  return 5;\n}",
    }
  }
};

describe("selectSource", () => {
  it("selecting an already loaded source", function() {
    const initialState = {
      sources: fromJS({
        sources: {
          "fooSourceActor": sourcesFixtures.sources.fooSourceActor
        },
        sourcesText: {
          "fooSourceActor": sourcesFixtures.sourcesText.fooSourceActor
        }
      })
    };

    this.store = createStore({}, initialState);
    this.store.dispatch(selectSource(sourcesFixtures.sources.fooSourceActor));

    const fooSourceText = getSelectedSource(this.store.getState());
    expect(fooSourceText.get("actor")).to.equal("fooSourceActor");
  });

  it("selecting a source that hasn\'t been loaded", function() {
    const initialState = {
      sources: fromJS({
        sources: {
          "fooSourceActor": sourcesFixtures.sources.fooSourceActor
        },
        sourcesText: {}
      })
    };

    this.store = createStore(simpleMockThreadClient, initialState);
    this.store.dispatch(selectSource(sourcesFixtures.sources.fooSourceActor));

    const fooSourceText = getSelectedSource(this.store.getState());
    expect(fooSourceText.get("actor")).to.equal("fooSourceActor");
  });
});
