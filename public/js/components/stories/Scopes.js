"use strict";
const React = require("react");
const { DOM: dom, createElement, createFactory } = React;
const { renderComponent, storiesOf } = require("./utils");

const Scopes = require("../Scopes");

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

const component = dom.div(
  { className: "accordion" },
  dom.div({ className: "_content" }, createElement(createFactory(Scopes)))
);

function renderScopes(fixtureName) {
  return renderComponent(component, fixtureName, { style });
}

storiesOf("Scopes", module)
  .add("Not Paused", () => renderScopes("todomvc"))
  .add("Event Handler", () => renderScopes("todomvcUpdateOnEnter"))
  .add("Nested Closures", () => renderScopes("pythagorean"));
