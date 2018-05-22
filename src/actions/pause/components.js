/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { getSelectedFrame } from "../../selectors";
import reactComponentTree from "../../utils/reactComponentTree";
import type { ThunkArgs } from "../types";

function getAncestors(evaluate: Function) {
  return evaluate(`(${reactComponentTree})().getAncestors(this)`);
}

async function loadArrayItems(client, consoleGrip) {
  if (!consoleGrip || !consoleGrip.result) {
    return;
  }

  const arrayGrip = await client.getProperties(consoleGrip.result);
  const itemValues = Object.values(arrayGrip.ownProperties)
    .map(i => i.value)
    .filter(o => o.type == "object");

  const itemGrips = await Promise.all(
    itemValues.map(item => client.getProperties(item))
  );

  return itemGrips.map(itemGrip =>
    Object.entries(itemGrip.ownProperties)
      .map(([k, v]) => [k, v.value])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {})
  );
}

export function fetchComponentAncestors() {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const selectedFrame = getSelectedFrame(getState());
    if (!selectedFrame) {
      return;
    }

    const ancestorsGrip = await getAncestors(expr =>
      client.evaluateInFrame(expr, selectedFrame.id)
    );

    const ancestors = await loadArrayItems(client, ancestorsGrip);

    dispatch({
      type: "SET_COMPONENT_ANCESTORS",
      ancestors
    });

    return ancestors;
  };
}

export function selectComponent(id: number) {
  return {
    type: "SELECT_COMPONENT",
    id
  };
}
