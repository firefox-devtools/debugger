/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  actions,
  createStore,
  getTelemetryEvents
} from "../../../utils/test-head";

describe("pauseOnExceptions", () => {
  it("should track telemetry for pauseOnException changes", async () => {
    const { dispatch } = createStore({ pauseOnExceptions: () => {} });
    dispatch(actions.pauseOnExceptions(true, false));

    const pauseTelemetry = getTelemetryEvents("pause_on_exceptions");

    expect(pauseTelemetry).toHaveLength(1);
    /* eslint-disable camelcase */
    expect(pauseTelemetry[0]).toEqual({
      exceptions: true,
      caught_exceptio: false
    });
    /* eslint-enable camelcase */
  });
});
