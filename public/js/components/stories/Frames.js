const React = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Frames = React.createFactory(require("../Frames"));

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

function renderFrames(fixtureName) {
  return renderComponent(Frames(), fixtureName, { style });
}

storiesOf("Frames", module)
  .add("Not Paused", () => renderFrames("todomvc"))
  .add("Event Handler", () => renderFrames("todomvcUpdateOnEnter"))
  .add("Nested Closures", () => renderFrames("pythagorean"));
