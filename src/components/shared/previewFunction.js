import { DOM as dom } from "react";

import times from "lodash/times";
import zip from "lodash/zip";
import flatten from "lodash/flatten";

import "./previewFunction.css";

function getFunctionName(func) {
  return (
    func.userDisplayName || func.displayName || func.name || func.value || ""
  );
}

function renderFunctionName(func) {
  const name = getFunctionName(func);
  return dom.span({ className: "function-name" }, name);
}

function renderParams(func) {
  const { parameterNames = [] } = func;
  let params = parameterNames
    .filter(i => i)
    .map(param => dom.span({ className: "param" }, param));

  const commas = times(params.length - 1).map(() =>
    dom.span({ className: "delimiter" }, ", ")
  );

  return flatten(zip(params, commas));
}

function renderParen(paren) {
  return dom.span({ className: "paren" }, paren);
}

function previewFunction(func) {
  return dom.span(
    { className: "function-signature" },
    renderFunctionName(func),
    renderParen("("),
    ...renderParams(func),
    renderParen(")")
  );
}

export default previewFunction;
