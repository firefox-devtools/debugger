/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global beforeAll, afterAll */
const { shallow } = require("enzyme");

const {
  REPS,
} = require("../rep");

let { Rep } = REPS;

const stubs = require("../stubs/failure");

let originalConsoleError;
beforeAll(() => {
  // Let's override the console.error function so we don't get an error message
  // in the jest output for the expected exception.
  originalConsoleError = window.console.error;
  window.console.error = () => {};
});

describe("test Failure", () => {
  const stub = stubs.get("Failure");

  it("Fallback rendering has expected text content", () => {
    const renderedComponent = shallow(Rep({
      object: stub
    }));
    expect(renderedComponent.text()).toEqual("Invalid object");
  });

  it("Fallback rendering has expected text content", () => {
    const renderedComponent = shallow(Rep({
      object: [1, stub, 2]
    }));
    expect(renderedComponent.text()).toEqual("[ 1, Invalid object, 2 ]");
  });
});

afterAll(() => {
  // Reverting the override.
  window.console.error = originalConsoleError;
});
