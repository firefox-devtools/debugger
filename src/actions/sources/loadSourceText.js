// @flow
import { PROMISE } from "../utils/middleware/promise";
import { setEmptyLines, setSymbols } from "../ast";
import { getSource } from "../../selectors";
import { setSource } from "../../workers/parser";
import type { Source } from "../../types";
import type { ThunkArgs } from "../types";

async function loadSource(source: Source, { sourceMaps, client }) {
  if (sourceMaps.isOriginalId(source.id)) {
    return await sourceMaps.getOriginalSourceText(source);
  }

  const response = await client.sourceContents(source.id);

  return {
    id: source.id,
    text: response.source,
    contentType: response.contentType || "text/javascript"
  };
}

/**
 * @memberof actions/sources
 * @static
 */
export function loadSourceText(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    // Fetch the source text only once.
    if (source.text) {
      return Promise.resolve(source);
    }

    await dispatch({
      type: "LOAD_SOURCE_TEXT",
      source: source,
      [PROMISE]: loadSource(source, { sourceMaps, client })
    });

    const newSource = getSource(getState(), source.id).toJS();
    if (newSource.isWasm) {
      return;
    }

    await setSource(newSource);
    await dispatch(setSymbols(source.id));
    await dispatch(setEmptyLines(source.id));
  };
}
