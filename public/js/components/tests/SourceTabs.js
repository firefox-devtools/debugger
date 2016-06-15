"use strict";

const SourceTabs = require("../SourceTabs");
const { renderComponent } = require("../test-utils");
const { stubConfig, resetConfig } = require("../../configs/feature");

function getSourceTabs($el) {
  return $el.querySelectorAll(".source-tab");
}

function getTitle($el) {
  return $el.querySelector(".filename").innerText;
}

describe("SourceTabs", function() {
  it("Many Tabs", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(SourceTabs, "todomvc");
    const tabs = getSourceTabs($el);
    expect(tabs.length).to.equal(3);
    expect(getTitle(tabs[0])).to.equal("todo-view.js");
  });

  it("Disabled", function() {
    if (typeof window != "object") {
      return;
    }

    stubConfig({ features: { tabs: false }});
    const $el = renderComponent(SourceTabs, "todomvc");
    resetConfig();

    const tabs = getSourceTabs($el);
    expect(tabs.length).to.equal(1);
    expect(getTitle(tabs[0])).to.equal("todo.js");
  });
});
