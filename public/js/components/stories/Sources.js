"use strict";
const React = require("react");
const { createElement, createFactory } = React;
const { renderComponent, storiesOf } = require("./utils");

const Sources = require("../Sources");

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

const component = createElement(createFactory(Sources));

function renderSources(fixtureName) {
  return renderComponent(component, fixtureName, { style });
}

storiesOf("Sources", module)
  .add("TodoMVC", () => renderSources("todomvc"))
  .add("Nested Closures", () => renderSources("pythagorean"));
