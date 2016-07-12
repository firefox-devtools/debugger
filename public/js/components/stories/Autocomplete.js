"use strict";
const React = require("react");
const { DOM: dom } = React;

const { createElement, createFactory } = React;
const { storiesOf } = require("./utils");
const Autocomplete = require("../Autocomplete");

const style = {
  width: "500px",
  margin: "auto",
  paddingTop: "100px" };

function renderAutocomplete(props) {
  return dom.div({ style }, createElement(createFactory(Autocomplete), props));
}

storiesOf("Autocomplete", module)
  .add("Simple", () => {
    return renderAutocomplete({
      selectItem: () => {},
      items: [
        { value: "a/b/c.js", title: "c.js", subtitle: "a/b" },
        { value: "a/f/e/g.js", title: "g.js", subtitle: "a/f/e" }
      ]
    });
  });
