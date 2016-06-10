"use strict";

const { createElement, createFactory } = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Frames = require("../Editor");

const style = {
  width: "700px",
  height: "600px",
  position: "relative",
  margin: "auto",
  marginTop: "100px" };

const component = createElement(createFactory(Frames));

function renderEditor(fixtureName) {
  return renderComponent(component, fixtureName, { style });
}

storiesOf("Editor", module)
  .add("TodoMVC", () => renderEditor("todomvc"));
