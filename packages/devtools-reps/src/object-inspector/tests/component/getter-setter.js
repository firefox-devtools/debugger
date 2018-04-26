/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const { MODE } = require("../../../reps/constants");
const {
  formatObjectInspector,
  waitForLoadedProperties
} = require("../test-utils");

const accessorStubs = require("../../../reps/stubs/accessor");
const ObjectClient = require("../__mocks__/object-client");

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 1,
    createObjectClient: grip => ObjectClient(grip),
    mode: MODE.LONG,
    ...overrides
  };
}

describe("ObjectInspector - getters & setters", () => {
  it("renders getters as expected", async () => {
    const stub = accessorStubs.get("getter");
    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              name: "x",
              contents: stub
            }
          ]
        })
      )
    );

    const store = oi.instance().getStore();
    await waitForLoadedProperties(store, ["root"]);
    oi.update();

    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("renders setters as expected", async () => {
    const stub = accessorStubs.get("setter");
    const oi = mount(
      ObjectInspector(
        generateDefaults({
          autoExpandDepth: 1,
          roots: [
            {
              path: "root",
              name: "x",
              contents: stub
            }
          ]
        })
      )
    );

    const store = oi.instance().getStore();
    await waitForLoadedProperties(store, ["root"]);
    oi.update();

    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("renders getters and setters as expected", async () => {
    const stub = accessorStubs.get("getter setter");
    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              name: "x",
              contents: stub
            }
          ]
        })
      )
    );

    const store = oi.instance().getStore();
    await waitForLoadedProperties(store, ["root"]);
    oi.update();

    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });
});
