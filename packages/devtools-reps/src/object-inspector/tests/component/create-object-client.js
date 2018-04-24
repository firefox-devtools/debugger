/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const ObjectClient = require("../__mocks__/object-client");

const {
  createNode,
  makeNodesForEntries,
  makeNumericalBuckets
} = require("../../utils/node");

const repsPath = "../../../reps";
const gripRepStubs = require(`${repsPath}/stubs/grip`);
const gripArrayRepStubs = require(`${repsPath}/stubs/grip-array`);

describe("createObjectClient", () => {
  it("is called with the expected object for regular node", () => {
    const stub = gripRepStubs.get("testMoreThanMaxProps");
    const createObjectClient = jest.fn(grip => ObjectClient(grip));
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
        createObjectClient
      })
    );

    expect(createObjectClient.mock.calls[0][0]).toBe(stub);
  });

  it("is called with the expected object for entries node", () => {
    const grip = Symbol();
    const mapStubNode = createNode({ name: "map", contents: { value: grip } });
    const entriesNode = makeNodesForEntries(mapStubNode);

    const createObjectClient = jest.fn(x => ObjectClient(x));
    mount(
      ObjectInspector({
        autoExpandDepth: 1,
        roots: [entriesNode],
        createObjectClient
      })
    );
    expect(createObjectClient.mock.calls[0][0]).toBe(grip);
  });

  it("is called with the expected object for bucket node", () => {
    const grip = gripArrayRepStubs.get("testMaxProps");
    const root = createNode({ name: "root", contents: { value: grip } });
    const [bucket] = makeNumericalBuckets(root);

    const createObjectClient = jest.fn(x => ObjectClient(x));
    mount(
      ObjectInspector({
        autoExpandDepth: 1,
        roots: [bucket],
        createObjectClient
      })
    );
    expect(createObjectClient.mock.calls[0][0]).toBe(grip);
  });

  it("is called with the expected object for sub-bucket node", () => {
    const grip = gripArrayRepStubs.get("testMaxProps");
    const root = createNode({ name: "root", contents: { value: grip } });
    const [bucket] = makeNumericalBuckets(root);
    const [subBucket] = makeNumericalBuckets(bucket);

    const createObjectClient = jest.fn(x => ObjectClient(x));
    mount(
      ObjectInspector({
        autoExpandDepth: 1,
        roots: [subBucket],
        createObjectClient
      })
    );
    expect(createObjectClient.mock.calls[0][0]).toBe(grip);
  });

  it("doesn't fail when ObjectClient doesn't have expected methods", () => {
    const stub = gripRepStubs.get("testMoreThanMaxProps");
    const root = createNode({ name: "root", contents: { value: stub } });

    // Override console.error so we don't spam test results.
    const originalConsoleError = console.error;
    console.error = () => {};

    const createObjectClient = x => ({});
    mount(
      ObjectInspector({
        autoExpandDepth: 1,
        roots: [root],
        createObjectClient
      })
    );

    // rollback console.error.
    console.error = originalConsoleError;
  });
});
