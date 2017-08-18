// @flow

import { DOM as dom } from "react";

import { times } from "lodash";
import { zip } from "lodash";
import { flatten } from "lodash";

import { simplifyDisplayName } from "../../utils/frame";

import "./previewFunction.css";

type FunctionType = {
  name: string,
  displayName?: string,
  userDisplayName?: string,
  parameterNames?: string[]
};

function getFunctionName(func: FunctionType) {
  const name = func.userDisplayName || func.displayName || func.name;
  return simplifyDisplayName(name);
}

function renderFunctionName(func: FunctionType) {
  const name = getFunctionName(func);
  return dom.span({ className: "function-name" }, name);
}

function renderParams(func: FunctionType) {
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

function previewFunction(func: FunctionType) {
  return dom.span(
    { className: "function-signature" },
    renderFunctionName(func),
    renderParen("("),
    ...renderParams(func),
    renderParen(")")
  );
}

export default previewFunction;
