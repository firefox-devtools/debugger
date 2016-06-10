"use strict";

const { DOM: dom, createElement, createFactory } = require("react");
const { renderComponent, storiesOf } = require("./utils");

const Breakpoints = require("../Breakpoints");

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

const component =
  dom.div({ className: "accordion" },
    dom.div({ className: "_content" },
      dom.div({ className: "breakpoints-pane" },
        createElement(createFactory(Breakpoints)))));

function renderBreakpoints(fixtureName) {
  return renderComponent(component, fixtureName, { style });
}

storiesOf("Breakpoints", module)
  .add("No Breakpoints", () => renderBreakpoints("todomvc"))
  .add("1 Breakpoint", () => renderBreakpoints("todomvcUpdateOnEnter"));
