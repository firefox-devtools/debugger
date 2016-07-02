"use strict";
const React = require("react");
const { createElement, createFactory } = React;
const { renderComponent, storiesOf } = require("./utils");
const { resetConfig, setConfig } = require("../../../../config/feature");

const SourceTabs = require("../SourceTabs");

const style = {
  width: "300px",
  margin: "auto",
  paddingTop: "100px" };

const component = createElement(createFactory(SourceTabs));

function renderSourceTabs(fixtureName) {
  return renderComponent(component, fixtureName, { style });
}

storiesOf("SourceTabs", module)
  .add("One Tab", () => {
    resetConfig();
    return renderSourceTabs("todomvcUpdateOnEnter");
  })
  .add("Many Tabs", () => {
    resetConfig();
    return renderSourceTabs("todomvc");
  })
  .add("Disabled", () => {
    setConfig({ features: { tabs: false }});
    return renderSourceTabs("todomvc");
  });
