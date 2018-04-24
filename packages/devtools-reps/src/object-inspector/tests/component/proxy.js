/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const { MODE } = require("../../../reps/constants");
const stub = require("../../../reps/stubs/grip").get("testProxy");
const { formatObjectInspector } = require("../test-utils");

const ObjectClient = require("../__mocks__/object-client");
function generateDefaults(overrides) {
  return {
    roots: [
      {
        path: "root",
        contents: { value: stub }
      }
    ],
    autoExpandDepth: 1,
    mode: MODE.LONG,
    createObjectClient: grip => ObjectClient(grip),
    // Have the prototype already loaded so the component does not call
    // enumProperties for the root's properties.
    loadedProperties: new Map([["root", { prototype: {} }]]),
    ...overrides
  };
}

function getEnumPropertiesMock() {
  return jest.fn(() => ({
    iterator: {
      slice: () => ({})
    }
  }));
}

describe("ObjectInspector - Proxy", () => {
  it("renders Proxy as expected", () => {
    const enumProperties = getEnumPropertiesMock();

    const props = generateDefaults({
      createObjectClient: grip => ObjectClient(grip, { enumProperties })
    });
    const oi = mount(ObjectInspector(props));
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // enumProperties should not have been called.
    expect(enumProperties.mock.calls).toHaveLength(0);
  });

  it("calls enumProperties on <target> and <handler> clicks", () => {
    const enumProperties = getEnumPropertiesMock();

    const props = generateDefaults({
      createObjectClient: grip => ObjectClient(grip, { enumProperties })
    });
    const oi = mount(ObjectInspector(props));

    const nodes = oi.find(".node");

    const targetNode = nodes.at(1);
    const handlerNode = nodes.at(2);

    targetNode.simulate("click");
    // The function is called twice,
    // to get both non-indexed and indexed properties.
    expect(enumProperties.mock.calls).toHaveLength(2);
    expect(enumProperties.mock.calls[0][0]).toEqual({
      ignoreNonIndexedProperties: true
    });
    expect(enumProperties.mock.calls[1][0]).toEqual({
      ignoreIndexedProperties: true
    });

    handlerNode.simulate("click");
    // The function is called twice,
    // to get  both non-indexed and indexed properties.
    expect(enumProperties.mock.calls).toHaveLength(4);
    expect(enumProperties.mock.calls[2][0]).toEqual({
      ignoreNonIndexedProperties: true
    });
    expect(enumProperties.mock.calls[3][0]).toEqual({
      ignoreIndexedProperties: true
    });
  });
});
