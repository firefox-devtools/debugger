/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

jest.mock("devtools-modules", () => {
  function MockTelemetry() {}
  MockTelemetry.prototype.recordEvent = jest.fn();

  return {
    Telemetry: MockTelemetry
  };
});

import { Telemetry } from "devtools-modules";
import { recordEvent, setupTelemetry } from "../telemetry";

const telemetry = new Telemetry(-1);

describe("telemetry.recordEvent()", () => {
  it("Receives the correct telemetry information", () => {
    setupTelemetry(-1);
    recordEvent("foo", {
      bar: 1
    });
    expect(telemetry.recordEvent).toHaveBeenCalledWith(
      "devtools.main",
      "foo",
      "debugger",
      null,
      {
        bar: 1
      }
    );
  });
});
