"use strict";

const Scopes = require("../Scopes");
const { renderComponent } = require("../test-utils");

function getScopes($el) {
  return $el.querySelectorAll(".tree-node");
}

describe("Scopes", function() {
  it("Not Paused", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Scopes, "todomvc");
    expect($el.innerText).to.equal("Not Paused");
  });

  it("TodoMVC Event Handler", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Scopes, "todomvcUpdateOnEnter");
    const scopes = getScopes($el);
    expect(scopes.length).to.equal(2);
    expect(scopes[0].innerText.trim()).to.equal("app.TodoView<.updateOnEnter");
  });
});
