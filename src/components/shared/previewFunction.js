import React from "react";
const { DOM: dom } = React;

const times = require("lodash/times");
const zip = require("lodash/zip");
const flatten = require("lodash/flatten");

require("./previewFunction.css");

function renderFunctionName(value) {
  const name = value.userDisplayName || value.displayName || value.name || "";
  return dom.span({ className: "function-name" }, name);
}

function renderParams(value) {
  const { parameterNames = [] } = value;
  let params = parameterNames
    .filter(i => i)
    .map(param => dom.span({ className: "param" }, param));

  const commas = times(params.length - 1).map(() =>
    dom.span({ className: "delimiter" }, ", "));

  return flatten(zip(params, commas));
}

function renderParen(paren) {
  return dom.span({ className: "paren" }, paren);
}

function previewFunction(value) {
  return dom.span(
    { className: "function-signature" },
    renderFunctionName(value),
    renderParen("("),
    ...renderParams(value),
    renderParen(")")
  );
}

module.exports = previewFunction;
