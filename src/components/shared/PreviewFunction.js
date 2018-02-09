/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";

import { times, zip, flatten } from "lodash";

import { simplifyDisplayName } from "../../utils/frame";

import "./PreviewFunction.css";

type FunctionType = {
  name: string,
  displayName?: string,
  userDisplayName?: string,
  parameterNames?: string[]
};

type Props = { func: FunctionType };

function getFunctionName(func: FunctionType) {
  const name = func.userDisplayName || func.displayName || func.name;
  return simplifyDisplayName(name);
}

export default class PreviewFunction extends Component<Props> {
  renderFunctionName(func: FunctionType) {
    const name = getFunctionName(func);
    return <span className="function-name">{name}</span>;
  }

  renderParams(func: FunctionType) {
    const { parameterNames = [] } = func;
    const params = parameterNames.filter(i => i).map(param => (
      <span className="param" key={param}>
        {param}
      </span>
    ));

    const commas = times(params.length - 1).map((_, i) => (
      <span className="delimiter" key={i}>
        {", "}
      </span>
    ));

    return flatten(zip(params, commas));
  }

  render() {
    return (
      <span className="function-signature">
        {this.renderFunctionName(this.props.func)}
        <span className="paren">(</span>
        {this.renderParams(this.props.func)}
        <span className="paren">)</span>
      </span>
    );
  }
}
