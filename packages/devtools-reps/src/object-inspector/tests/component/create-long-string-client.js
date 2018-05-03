/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const ObjectClient = require("../__mocks__/object-client");
const LongStringClient = require("../__mocks__/long-string-client");

const repsPath = "../../../reps";
const longStringStubs = require(`${repsPath}/stubs/long-string`);

describe("createLongStringClient", () => {
  it("is called with the expected object for longString node", () => {
    const stub = longStringStubs.get("testUnloadedFullText");
    const createLongStringClient = jest.fn(grip => LongStringClient(grip));

    mount(
      ObjectInspector({
        autoExpandDepth: 1,
        roots: [
          {
            path: "root",
            contents: {
              value: stub
            }
          }
        ],
        createObjectClient: ObjectClient(stub),
        createLongStringClient
      })
    );

    expect(createLongStringClient.mock.calls[0][0]).toBe(stub);
  });

  describe("substring", () => {
    it("is called for longStrings with unloaded full text", () => {
      const stub = longStringStubs.get("testUnloadedFullText");
      const substring = jest.fn(() => Promise.resolve({ fullText: "" }));
      const createLongStringClient = jest.fn(grip =>
        LongStringClient(grip, { substring })
      );

      mount(
        ObjectInspector({
          autoExpandDepth: 1,
          roots: [
            {
              path: "root",
              contents: {
                value: stub
              }
            }
          ],
          createObjectClient: ObjectClient(stub),
          createLongStringClient
        })
      );

      expect(substring.mock.calls[0]).toHaveLength(3);
      const [initialLength, fullTextLength] = substring.mock.calls[0];
      expect(initialLength).toBe(stub.initial.length);
      expect(fullTextLength).toBe(stub.length);
    });

    it("is not called for longString node w/ loaded full text", () => {
      const stub = longStringStubs.get("testLoadedFullText");
      const substring = jest.fn(() => Promise.resolve({ fullText: "" }));
      const createLongStringClient = jest.fn(grip =>
        LongStringClient(grip, { substring })
      );

      mount(
        ObjectInspector({
          autoExpandDepth: 1,
          roots: [
            {
              path: "root",
              contents: {
                value: stub
              }
            }
          ],
          createObjectClient: ObjectClient(stub),
          createLongStringClient
        })
      );

      expect(createLongStringClient.mock.calls[0][0]).toBe(stub);
      expect(substring.mock.calls).toHaveLength(0);
    });
  });
});
