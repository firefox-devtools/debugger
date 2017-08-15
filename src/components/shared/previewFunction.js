// @flow

import React from "react";
import times from "lodash/times";
import zip from "lodash/zip";
import flatten from "lodash/flatten";

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
  return (
    <span className="function-name">
      {" "}{name}{" "}
    </span>
  );
}

function renderParams(func: FunctionType) {
  const { parameterNames = [] } = func;
  let params = parameterNames.filter(i => i).map(param =>
    <span className="param">
      {" "}{param}{" "}
    </span>
  );

  const commas = times(params.length - 1).map(() =>
    <span className="delimiter">
      {" "}{", "}{" "}
    </span>
  );

  return flatten(zip(params, commas));
}

function renderParen(paren) {
  return (
    <span className="paren">
      {" "}{paren}{" "}
    </span>
  );
}

function previewFunction(func: FunctionType) {
  return (
    <span className="function-signature">
      {renderFunctionName(func)}
      {renderParen("(")}
      {renderParams(func).map(item => item)}
      {renderParen(")")}
    </span>
  );
}

export default previewFunction;
