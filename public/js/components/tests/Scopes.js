"use strict";
const React = require("react");
const ReactDOM = require("react-dom");

const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");
const { fromJS } = require("immutable");

const { createStore } = require("../stories/utils");

const Scopes = React.createFactory(require("../Scopes"));
const fixtures = require("../../test/fixtures");

function getData(fixtureName) {
  const fixture = fixtures[fixtureName];
  return {
    pause: fromJS({
      pause: fixture.pause.pause,
      loadedObjects: fixture.pause.loadedObjects
    })
  };
}

function getScopes($el) {
  return $el.querySelectorAll(".tree-node");
}

function renderContainer(fixtureName, Component) {
  const data = getData(fixtureName);
  const store = createStore(data);

  const $el = document.querySelector("#sandbox");
  $el.innerHTML = "";
  ReactDOM.render(dom.div(
    {},
    createElement( Provider, { store }, createElement(Component))
  ), $el);

  return $el;
}

describe("Scopes", function() {
  it("Not Paused", function() {
    if (typeof window != "object") {
      return;
    }
    const $el = renderContainer("todomvc", Scopes);
    expect($el.innerText).to.equal("Not Paused");
  });

  it("TodoMVC Event Handler", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderContainer("todomvcUpdateOnEnter", Scopes);
    expect(getScopes($el).length).to.equal(2);
    expect(getScopes($el)[0].innerText.trim()).to.equal("app.TodoView<.updateOnEnter")
  });
});
