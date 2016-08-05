const React = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Expressions = React.createFactory(require("../Expressions"));

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

function renderExpressions(fixtureName) {
  return renderComponent(Expressions(), fixtureName, { style });
}

storiesOf("Watch Expressions", module)
  .add("No Expressions", () => renderExpressions("todomvc"))
  .add("One Expression", () => renderExpressions("todomvcUpdateOnEnter"));
