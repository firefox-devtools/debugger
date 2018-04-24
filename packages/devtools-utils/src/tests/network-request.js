/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.useFakeTimers();
const networkRequest = require("../network-request");

function fetch(status, text) {
  return () => Promise.resolve({
    status,
    text: () => Promise.resolve(text)
  });
}

describe("network request", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("successful fetch", async () => {
    global.fetch.mockImplementation(fetch(200, "Yay"));
    const res = await networkRequest("foo");
    expect(res).toEqual({content: "Yay"});
  });

  it("failed fetch", async () => {
    global.fetch.mockImplementation(fetch(400, "Sad"));
    try {
      await networkRequest("foo");
    } catch (e) {
      expect(e.message).toEqual("failed to request foo");
    }
  });

  it("timed out fetch", async () => {
    global.fetch.mockImplementation(() => (new Promise((resolve) => {})));

    networkRequest("foo").catch(e => expect(e.message).toEqual("Connect timeout error"));

    jest.runAllTimers();
  });
});
