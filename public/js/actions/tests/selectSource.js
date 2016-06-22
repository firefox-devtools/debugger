"use strict";

const { actions, selectors, createStore } = require("../../util/test-head");
const fixtures = require("../../test/fixtures/foobar.json");
const fromJS = require("../../util/fromJS");
const expect = require("expect.js");

const { getSelectedSource, getSourceTabs } = selectors;
const { selectSource } = actions;
const sourcesFixtures = fixtures.sources;

const simpleMockThreadClient = {
  source: function(sourceId) {
    return new Promise((resolve, reject) => {
      resolve(sourcesFixtures.sources[sourceId]);
    });
  },
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      resolve(sourcesFixtures.sourcesText[sourceId]);
    });
  }
};

describe("selectSource", function() {
  it("selecting an already loaded source", function() {
    const initialState = {
      sources: fromJS({
        sources: {
          "fooSourceActor": sourcesFixtures.sources.fooSourceActor
        },
        sourcesText: {
          "fooSourceActor": sourcesFixtures.sourcesText.fooSourceActor
        },
        tabs: []
      })
    };

    this.store = createStore({}, initialState);
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );

    const fooSelectedSource = getSelectedSource(this.store.getState());
    expect(fooSelectedSource.get("id")).to.equal("fooSourceActor");

    const sourceTabs = getSourceTabs(this.store.getState());
    expect(sourceTabs.count()).to.equal(1);
    expect(sourceTabs.get(0).get("id")).to.equal("fooSourceActor");
  });

  it("selecting a source that hasn\'t been loaded", function() {
    const initialState = {
      sources: fromJS({
        sources: {
          "fooSourceActor": sourcesFixtures.sources.fooSourceActor
        },
        sourcesText: {},
        tabs: []
      })
    };

    this.store = createStore(simpleMockThreadClient, initialState);
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );

    const fooSelectedSource = getSelectedSource(this.store.getState());
    expect(fooSelectedSource.get("id")).to.equal("fooSourceActor");

    const sourceTabs = getSourceTabs(this.store.getState());
    expect(sourceTabs.count()).to.equal(1);
    expect(sourceTabs.get(0).get("id")).to.equal("fooSourceActor");
  });
});
