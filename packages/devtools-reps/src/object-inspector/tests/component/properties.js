/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));

const gripRepStubs = require("../../../reps/stubs/grip");
const ObjectClient = require("../__mocks__/object-client");

const { formatObjectInspector } = require("../test-utils");

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 0,
    createObjectClient: grip => ObjectClient(grip),
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

describe("ObjectInspector - properties", () => {
  it("does not load properties if properties are already loaded", () => {
    const stub = gripRepStubs.get("testMaxProps");
    const enumProperties = getEnumPropertiesMock();

    mount(
      ObjectInspector(
        generateDefaults({
          autoExpandDepth: 1,
          roots: [
            {
              path: "root",
              contents: {
                value: stub
              }
            }
          ],
          createObjectClient: grip => ObjectClient(grip, { enumProperties }),
          loadedProperties: new Map([
            ["root", { ownProperties: stub.preview.ownProperties }]
          ])
        })
      )
    );

    expect(enumProperties.mock.calls).toHaveLength(0);
  });

  it("calls enumProperties when expandable leaf is clicked", () => {
    const stub = gripRepStubs.get("testMaxProps");
    const enumProperties = getEnumPropertiesMock();

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              contents: {
                value: stub
              }
            }
          ],
          createObjectClient: grip => ObjectClient(grip, { enumProperties })
        })
      )
    );

    const node = oi.find(".node");
    node.simulate("click");

    // The function is called twice, to get both non-indexed and indexed props.
    expect(enumProperties.mock.calls).toHaveLength(2);
    expect(enumProperties.mock.calls[0][0]).toEqual({
      ignoreNonIndexedProperties: true
    });
    expect(enumProperties.mock.calls[1][0]).toEqual({
      ignoreIndexedProperties: true
    });
  });

  it("renders uninitialized bindings", () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              name: "someFoo",
              path: "root/someFoo",
              contents: {
                value: {
                  uninitialized: true
                }
              }
            }
          ]
        })
      )
    );

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });

  it("renders unmapped bindings", () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              name: "someFoo",
              path: "root/someFoo",
              contents: {
                value: {
                  unmapped: true
                }
              }
            }
          ]
        })
      )
    );

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });

  it("renders unscoped bindings", () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              name: "someFoo",
              path: "root/someFoo",
              contents: {
                value: {
                  unscoped: true
                }
              }
            }
          ]
        })
      )
    );

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });
});
