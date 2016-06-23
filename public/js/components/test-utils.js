"use strict";

const { createElement, createFactory } = require("react");
const ReactDOM = require("react-dom");

const renderComponentFromFixture = require("../test/utils/renderComponentFromFixture");

function createElementWithAttributes(tag, attrs) {
  const $el = document.createElement(tag);
  Object.keys(attrs).forEach(key => {
    const attr = document.createAttribute(key);
    attr.value = attrs[key];
    $el.setAttributeNode(attr);
  });

  return $el;
}

function getSandbox() {
  let $el = document.querySelector("#sandbox");
  if ($el) {
    $el.remove();
  }

  $el = createElementWithAttributes("div", {
    id: "sandbox",
    style: "top: 0; position: relative; height: 500px;"
  });

  document.body.appendChild($el);
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
