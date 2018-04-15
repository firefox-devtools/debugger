/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSymbols, getSource, getSelectedFrame } from "../../selectors";
import { isReactComponent, isImmutable } from "../../utils/preview";
import { findClosestClass } from "../../utils/ast";

import type { ThunkArgs } from "../types";

async function getReactProps(evaluate) {
  const reactDisplayName = await evaluate(
    "this.hasOwnProperty('_reactInternalFiber') ? " +
      "this._reactInternalFiber.type.name : " +
      "this._reactInternalInstance.getName()"
  );

  return {
    displayName: reactDisplayName.result
  };
}

async function getImmutableProps(expression: string, evaluate) {
  const immutableEntries = await evaluate((exp => `${exp}.toJS()`)(expression));

  const immutableType = await evaluate(
    (exp => `${exp}.constructor.name`)(expression)
  );

  return {
    type: immutableType.result,
    entries: immutableEntries.result
  };
}

async function getExtraProps(getState, expression, result, evaluate) {
  const props = {};
  if (isReactComponent(result)) {
    const selectedFrame = getSelectedFrame(getState());
    const source = getSource(getState(), selectedFrame.location.sourceId);
    const symbols = getSymbols(getState(), source);

    if (symbols && symbols.classes) {
      const originalClass = findClosestClass(symbols, selectedFrame.location);

      if (originalClass) {
        props.react = { displayName: originalClass.name };
      }
    }

    if (!props.react) {
      props.react = await getReactProps(evaluate);
    }
  }

  if (isImmutable(result)) {
    props.immutable = await getImmutableProps(expression, evaluate);
  }

  return props;
}

export function fetchExtra() {
  return async function({ dispatch, getState }: ThunkArgs) {
    const frame = getSelectedFrame(getState());
    const extra = await dispatch(getExtra("this;", frame.this));
    dispatch({
      type: "ADD_EXTRA",
      extra: extra
    });
  };
}

export function getExtra(expression: string, result: Object) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const selectedFrame = getSelectedFrame(getState());
    if (!selectedFrame) {
      return;
    }

    const extra = await getExtraProps(getState, expression, result, expr =>
      client.evaluateInFrame(expr, selectedFrame.id)
    );

    return extra;
  };
}
