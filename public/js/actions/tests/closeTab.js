"use strict";

const { actions, selectors, createStore } = require("../../util/test-head");
const fixtures = require("../../test/fixtures/foobar.json");
const fromJS = require("../../util/fromJS");
const expect = require("expect.js");

const { getSelectedSource, getSourceTabs } = selectors;
const { selectSource, closeTab } = actions;
const sourcesFixtures = fixtures.sources;

const oneSourceFixture = {
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

const threeSourcesFixture = {
  sources: fromJS({
    sources: {
      "fooSourceActor": sourcesFixtures.sources.fooSourceActor,
      "barSourceActor": sourcesFixtures.sources.barSourceActor,
      "bazzSourceActor": sourcesFixtures.sources.bazzSourceActor
    },
    sourcesText: {
      "fooSourceActor": sourcesFixtures.sourcesText.fooSourceActor,
      "barSourceActor": sourcesFixtures.sourcesText.barSourceActor,
      "bazzSourceActor": sourcesFixtures.sourcesText.bazzSourceActor
    },
    tabs: []
  })
};

describe("closeTab", function() {
  it("removing only tab", function() {
    this.store = createStore({}, oneSourceFixture);
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );

    this.store.dispatch(
      closeTab(sourcesFixtures.sources.fooSourceActor.id)
    );

    const selectedSource = getSelectedSource(this.store.getState());
    const sourceTabs = getSourceTabs(this.store.getState());

    expect(selectedSource).to.equal(null);
    expect(sourceTabs.count()).to.equal(0);
  });

  it("removing last tab should select the tab to the left", function() {
    this.store = createStore({}, threeSourcesFixture);
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.barSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.bazzSourceActor.id)
    );

    this.store.dispatch(
      closeTab(sourcesFixtures.sources.bazzSourceActor.id)
    );

    const selectedSource = getSelectedSource(this.store.getState());
    const sourceTabs = getSourceTabs(this.store.getState());

    expect(selectedSource.get("id")).to.equal("barSourceActor");
    expect(sourceTabs.count()).to.equal(2);
  });

  it("removing first tab should select tab to the right", function() {
    this.store = createStore({}, threeSourcesFixture);
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.barSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.bazzSourceActor.id)
    );

    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );
    this.store.dispatch(
      closeTab(sourcesFixtures.sources.fooSourceActor.id)
    );

    const selectedSource = getSelectedSource(this.store.getState());
    const sourceTabs = getSourceTabs(this.store.getState());

    expect(selectedSource.get("id")).to.equal("barSourceActor");
    expect(sourceTabs.count()).to.equal(2);
  });

  it("removing selected tab should select tab to the right", function() {
    this.store = createStore({}, threeSourcesFixture);

    this.store.dispatch(
      selectSource(sourcesFixtures.sources.fooSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.barSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.bazzSourceActor.id)
    );
    this.store.dispatch(
      selectSource(sourcesFixtures.sources.barSourceActor.id)
    );
    this.store.dispatch(
      closeTab(sourcesFixtures.sources.barSourceActor.id)
    );

    const selectedSource = getSelectedSource(this.store.getState());
    const sourceTabs = getSourceTabs(this.store.getState());

    expect(selectedSource.get("id")).to.equal("bazzSourceActor");
    expect(sourceTabs.count()).to.equal(2);
  });
});
