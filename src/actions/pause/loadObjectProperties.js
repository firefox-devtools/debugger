// @flow

import { PROMISE } from "../utils/middleware/promise";
import { getLoadedObject } from "../../selectors";
import type { ThunkArgs } from "../types";

/**
 * @memberof actions/pause
 * @static
 */
export function loadObjectProperties(object: any) {
  return ({ dispatch, client, getState }: ThunkArgs) => {
    const objectId = object.actor || object.objectId;

    if (getLoadedObject(getState(), objectId)) {
      return;
    }

    dispatch({
      type: "LOAD_OBJECT_PROPERTIES",
      objectId,
      [PROMISE]: client.getProperties(object)
    });
  };
}
