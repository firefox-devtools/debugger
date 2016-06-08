"use strict";

const { createElement, createFactory } = require("react");
const ReactDOM = require("react-dom");

const renderComponentFromFixture = require("../test/utils/renderComponentFromFixture");

function getSandbox() {
  let $el = document.querySelector("#sandbox");
  if (!$el) {
    const attribute = document.createAttribute("id");
    attribute.nodeValue = "sandbox";
    $el = document.createElement("div");
    $el.setAttributeNode(attribute);
    document.body.appendChild($el);
  }

  $el.innerHTML = "";

  return $el;
}

function renderComponent(Component, fixtureName, options = {}) {
  const $el = getSandbox();

  const component = renderComponentFromFixture(
    createElement(createFactory(Component)),
    fixtureName,
    options
  );

  return ReactDOM.render(component, $el);
}

module.exports = {
  renderComponent
};
