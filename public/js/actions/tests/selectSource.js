"use strict";

const { actions, selectors, createStore } = require("../../util/test-head");
const fixtures = require("../../test/fixtures/foobar.json");
const { fromJS } = require("immutable");
const expect = require("expect.js");

const { getSelectedSource } = selectors;
const { selectSource } = actions;
const sourcesFixtures = fixtures.sources;

const simpleMockThreadClient = {
  source: function(form) {
    return {
      source: () => {
        return new Promise((resolve, reject) => {
          resolve(sourcesFixtures.sources[form.id]);
        });
      }
    };
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
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );

    const fooSourceText = getSelectedSource(this.store.getState());
    expect(fooSourceText.get("id")).to.equal("fooSourceActor");
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
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );

    const fooSourceText = getSelectedSource(this.store.getState());
    expect(fooSourceText.get("id")).to.equal("fooSourceActor");
  });
});
