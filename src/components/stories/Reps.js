const { DOM: dom, createFactory } = require("react");
const { storiesOf } = require("./utils");

const Rep = require("../Rep");
const { todomvcUpdateOnEnter } = require("../../test/fixtures");

const frameScope = todomvcUpdateOnEnter.pause.pause.frame.scope;
const event = frameScope.bindings.arguments[0].e;
const handler = frameScope.function;

const style = {
  width: "500px",
  margin: "auto",
  paddingTop: "100px",
  fontSize: "0.8em" };

function renderReps(data) {
  return dom.div(
    { style, className: "theme-light" },
    createFactory(Rep)({ object: data })
  );
}

storiesOf("Reps", module)
  .add("handler", () => renderReps(handler))
  .add("event", () => renderReps(event));
