/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import type { Action } from "../types";

export const setSelectedLocation: Action = (source, location) => ({
  type: "SET_SELECTED_LOCATION",
  source,
  location
});

export const clearSelectedSource: Action = () => ({
  type: "CLEAR_SELECTED_SOURCE"
});
