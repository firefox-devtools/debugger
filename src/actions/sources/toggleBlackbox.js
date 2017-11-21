/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Redux actions for the sources state
 * @module actions/sources
 */

import { PROMISE } from "../utils/middleware/promise";
import assert from "../../utils/assert";
import { remapBreakpoints } from "../breakpoints";
import { throttle } from "lodash";
import { setEmptyLines, setOutOfScopeLocations } from "../ast";
import { syncBreakpoint } from "../breakpoints";
import { searchSource } from "../project-text-search";
import { closeActiveSearch } from "../ui";

import { getPrettySourceURL, isLoaded } from "../../utils/source";
import { createPrettySource } from "../sources/createPrettySource";
import { loadSourceText } from "../sources/loadSourceText";

import { prefs } from "../../utils/prefs";
import { removeDocument } from "../../utils/editor";
import {
  isThirdParty,
  isMinified,
  shouldPrettyPrint
} from "../../utils/source";
import { getGeneratedLocation } from "../../utils/source-maps";
import { isOriginalId } from "devtools-source-map";
import {
  getSource,
  getSources,
  getSourceByURL,
  getPendingSelectedLocation,
  getPendingBreakpointsForSource,
  getSourceTabs,
  getNewSelectedSourceId,
  getSelectedLocation,
  removeSourcesFromTabList,
  removeSourceFromTabList,
  getTextSearchQuery,
  getActiveSearch,
  getGeneratedSource
} from "../../selectors";

import type { Source } from "../../types";
import type { ThunkArgs } from "../types";
import type { State } from "../../reducers/types";

export type SelectSourceOptions = {
  tabIndex?: number,
  location?: { line: number, column?: ?number }
};

export function toggleBlackBox(source: Source) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const { isBlackBoxed, id } = source;

    return dispatch({
      type: "BLACKBOX",
      source,
      [PROMISE]: client.blackBox(id, isBlackBoxed)
    });
  };
}
