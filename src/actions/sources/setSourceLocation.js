/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import type { Action } from "../types";

export const setSourceLocation: Action = (url, options) => ({
  type: "SET_SOURCE_LOCATION",
  url: url,
  line: options.location ? options.location.line : null
});
