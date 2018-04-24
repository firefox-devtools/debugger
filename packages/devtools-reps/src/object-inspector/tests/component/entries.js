/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const { MODE } = require("../../../reps/constants");
const {
  formatObjectInspector,
  waitForDispatch,
  waitForLoadedProperties
} = require("../test-utils");
const gripMapRepStubs = require("../../../reps/stubs/grip-map");
const mapStubs = require("../../stubs/map");
const ObjectClient = require("../__mocks__/object-client");

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 0,
    createObjectClient: grip => ObjectClient(grip),
    ...overrides
  };
}

function getEnumEntriesMock() {
  return jest.fn(() => ({
    iterator: {
      slice: () => mapStubs.get("11-entries")
    }
  }));
}

describe("ObjectInspector - entries", () => {
  it("renders Object with entries as expected", async () => {
    const stub = gripMapRepStubs.get("testSymbolKeyedMap");
    const enumEntries = getEnumEntriesMock();

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          autoExpandDepth: 3,
          injectWaitService: true,
          roots: [
            {
              path: "root",
              contents: { value: stub }
            }
          ],
          mode: MODE.LONG,
          createObjectClient: grip => {
            return ObjectClient(grip, {
              enumEntries
            });
          },
          loadedProperties: new Map([["root", mapStubs.get("properties")]])
        })
      )
    );

    const store = oi.instance().getStore();
    await waitForLoadedProperties(store, [
      "Symbol(root/<entries>/0)",
      "Symbol(root/<entries>/1)"
    ]);

    oi.update();
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // enumEntries shouldn't have been called since everything
    // is already in the preview property.
    expect(enumEntries.mock.calls).toHaveLength(0);
  });

  it("calls ObjectClient.enumEntries when expected", async () => {
    const stub = gripMapRepStubs.get("testMoreThanMaxEntries");
    const enumEntries = getEnumEntriesMock();

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          autoExpandDepth: 1,
          injectWaitService: true,
          roots: [
            {
              path: "root",
              contents: {
                value: stub
              }
            }
          ],
          createObjectClient: grip => ObjectClient(grip, { enumEntries }),
          loadedProperties: new Map([
            ["root", { ownProperties: stub.preview.entries }]
          ])
        })
      )
    );

    expect(formatObjectInspector(oi)).toMatchSnapshot();

    const nodes = oi.find(".node");
    const entriesNode = nodes.at(1);
    expect(entriesNode.text()).toBe("<entries>");

    const store = oi.instance().getStore();
    const onEntrieLoad = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    entriesNode.simulate("click");
    await onEntrieLoad;
    oi.update();

    expect(formatObjectInspector(oi)).toMatchSnapshot();
    expect(enumEntries.mock.calls).toHaveLength(1);

    entriesNode.simulate("click");
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    entriesNode.simulate("click");

    expect(formatObjectInspector(oi)).toMatchSnapshot();
    // it does not call enumEntries if entries were already loaded.
    expect(enumEntries.mock.calls).toHaveLength(1);
  });
});
