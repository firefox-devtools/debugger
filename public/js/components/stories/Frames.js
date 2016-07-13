const { DOM: dom, createElement, createFactory } = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Frames = require("../Frames");

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

const component = dom.div(
  { className: "accordion" },
  dom.div({ className: "_content" }, createElement(createFactory(Frames)))
);

function renderFrames(fixtureName) {
  return renderComponent(component, fixtureName, { style });
}

storiesOf("Frames", module)
  .add("Not Paused", () => renderFrames("todomvc"))
  .add("Event Handler", () => renderFrames("todomvcUpdateOnEnter"))
  .add("Nested Closures", () => renderFrames("pythagorean"));
