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

/**
  Load the text for all the available sources
 * @memberof actions/sources
 * @static
 */
export function loadAllSources() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sources = getSources(getState());
    const query = getTextSearchQuery(getState());
    for (const [, src] of sources) {
      const source = src.toJS();
      if (isThirdParty(source)) {
        continue;
      }

      await dispatch(loadSourceText(source));
      // If there is a current search query we search
      // each of the source texts as they get loaded
      if (query) {
        await dispatch(searchSource(source.id, query));
      }
    }
  };
}
