/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const repsPath = "../../../reps";
const { MODE } = require(`${repsPath}/constants`);

const { formatObjectInspector, waitForDispatch } = require("../test-utils");
const ObjectClient = require("../__mocks__/object-client");
const gripRepStubs = require(`${repsPath}/stubs/grip`);

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 0,
    createObjectClient: grip => ObjectClient(grip),
    injectWaitService: true,
    mode: MODE.LONG,
    ...overrides
  };
}

describe("ObjectInspector - keyboard navigation", () => {
  it("works as expected", async () => {
    const stub = gripRepStubs.get("testMaxProps");

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [{ path: "root", contents: { value: stub } }]
        })
      )
    );
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    oi.simulate("focus");
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // Pressing right arrow key should expand the node and lod its properties.
    const onPropertiesLoaded = waitForDispatch(
      getStore(oi),
      "NODE_PROPERTIES_LOADED"
    );
    simulateKeyDown(oi, "ArrowRight");
    await onPropertiesLoaded;
    oi.update();
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // The child node should be focused.
    await keyNavigate(oi, "ArrowDown");
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // The root node should be focused again.
    await keyNavigate(oi, "ArrowLeft");
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // The child node should be focused again.
    await keyNavigate(oi, "ArrowRight");
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    // The root node should be focused again.
    await keyNavigate(oi, "ArrowUp");
    expect(formatObjectInspector(oi)).toMatchSnapshot();

    oi.simulate("blur");
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });
});

async function keyNavigate(oi, key) {
  const onFocusDispatched = waitForDispatch(getStore(oi), "NODE_FOCUS");
  simulateKeyDown(oi, key);
  await onFocusDispatched;
  oi.update();
}

function simulateKeyDown(oi, key) {
  oi.simulate("keydown", {
    key,
    preventDefault: () => {},
    stopPropagation: () => {}
  });
}

function getStore(oi) {
  return oi.instance().getStore();
}
