const React = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Breakpoints = React.createFactory(require("../Breakpoints"));

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

function renderBreakpoints(fixtureName) {
  return renderComponent(Breakpoints(), fixtureName, { style });
}

storiesOf("Breakpoints", module)
  .add("No Breakpoints", () => renderBreakpoints("todomvc"))
  .add("3 Breakpoints", () => renderBreakpoints("todomvcUpdateOnEnter"));
