const React = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Scopes = React.createFactory(require("../Scopes"));

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

function renderScopes(fixtureName) {
  return renderComponent(Scopes(), fixtureName, { style });
}

storiesOf("Scopes", module)
  .add("Not Paused", () => renderScopes("todomvc"))
  .add("Event Handler", () => renderScopes("todomvcUpdateOnEnter"))
  .add("Nested Closures", () => renderScopes("pythagorean"));
