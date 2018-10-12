/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { mountObjectInspector } = require("../test-utils");
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

function mount(props) {
  const client = { createObjectClient: grip => ObjectClient(grip) };

  return mountObjectInspector({
    client,
    props: generateDefaults(props)
  });
}

describe("ObjectInspector - getters & setters", () => {
  it("renders getters as expected", async () => {
    const stub = accessorStubs.get("getter");
    const { store, wrapper } = mount({
      roots: [
        {
          path: "root",
          name: "x",
          contents: stub
        }
      ]
    });

    await waitForLoadedProperties(store, ["root"]);
    wrapper.update();

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });

  it("renders setters as expected", async () => {
    const stub = accessorStubs.get("setter");
    const { store, wrapper } = mount({
      autoExpandDepth: 1,
      roots: [
        {
          path: "root",
          name: "x",
          contents: stub
        }
      ]
    });

    await waitForLoadedProperties(store, ["root"]);
    wrapper.update();

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });

  it("renders getters and setters as expected", async () => {
    const stub = accessorStubs.get("getter setter");
    const { store, wrapper } = mount({
      roots: [
        {
          path: "root",
          name: "x",
          contents: stub
        }
      ]
    });

    await waitForLoadedProperties(store, ["root"]);
    wrapper.update();

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });
});
