/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * When Flow 0.29 is released (very soon), we can use this Record type
 * instead of the builtin immutable.js Record type. This is better
 * because all the fields are actually typed, unlike the builtin one.
 * This depends on a performance fix that will go out in 0.29 though;
 * @module utils/makeRecord
 */

import * as I from "immutable";

/**
 * Make an immutable record type
 *
 * @param spec - the keys and their default values
 * @return a state record factory function
 * @memberof utils/makeRecord
 * @static
 */
function makeRecord<T>(spec: T & Object): (init: $Shape<T>) => I.RecordOf<T> {
  return I.Record(spec);
}

export default makeRecord;
