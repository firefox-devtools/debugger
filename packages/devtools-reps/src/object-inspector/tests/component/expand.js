/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const repsPath = "../../../reps";
const { MODE } = require(`${repsPath}/constants`);
const ObjectClient = require("../__mocks__/object-client");
const gripRepStubs = require(`${repsPath}/stubs/grip`);
const gripPropertiesStubs = require("../../stubs/grip");
const {
  formatObjectInspector,
  storeHasExactExpandedPaths,
  storeHasExpandedPath,
  storeHasLoadedProperty,
  waitForDispatch
} = require("../test-utils");
const { createNode, NODE_TYPES } = require("../../utils/node");

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 0,
    roots: [
      {
        path: "root-1",
        contents: {
          value: gripRepStubs.get("testMoreThanMaxProps")
        }
      },
      {
        path: "root-2",
        contents: {
          value: gripRepStubs.get("testProxy")
        }
      }
    ],
    createObjectClient: grip => ObjectClient(grip),
    mode: MODE.LONG,
    ...overrides
  };
}

describe("ObjectInspector - state", () => {
  it("has the expected expandedPaths state when clicking nodes", async () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          injectWaitService: true,
          loadedProperties: new Map([
            ["root-1", gripPropertiesStubs.get("proto-properties-symbols")]
          ])
        })
      )
    );

    const store = wrapper.instance().getStore();

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    let nodes = wrapper.find(".node");

    // Clicking on the root node adds it path to "expandedPaths".
    const root1 = nodes.at(0);
    const root2 = nodes.at(1);

    root1.simulate("click");

    expect(storeHasExactExpandedPaths(store, ["root-1"])).toBeTruthy();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    // Clicking on the root node removes it path from "expandedPaths".
    root1.simulate("click");
    expect(storeHasExactExpandedPaths(store, [])).toBeTruthy();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    const onPropertiesLoaded = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    root2.simulate("click");
    await onPropertiesLoaded;
    expect(storeHasExactExpandedPaths(store, ["root-2"])).toBeTruthy();

    wrapper.update();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    root1.simulate("click");
    expect(
      storeHasExactExpandedPaths(store, ["root-1", "root-2"])
    ).toBeTruthy();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    nodes = wrapper.find(".node");
    const propNode = nodes.at(1);
    const symbolNode = nodes.at(2);
    const protoNode = nodes.at(3);

    propNode.simulate("click");
    symbolNode.simulate("click");
    protoNode.simulate("click");

    expect(
      storeHasExactExpandedPaths(store, [
        "root-1",
        "root-2",
        "Symbol(root-1/<prototype>)"
      ])
    ).toBeTruthy();

    // The property and symbols have primitive values, and can't be expanded.
    expect(store.getState().expandedPaths.size).toBe(3);
  });

  it("has the expected state when expanding a node", async () => {
    const protoStub = {
      prototype: {
        type: "object",
        actor: "server2.conn0.child1/obj628",
        class: "Object"
      }
    };

    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          injectWaitService: true,
          createObjectClient: grip =>
            ObjectClient(grip, {
              getPrototype: () => Promise.resolve(protoStub)
            })
        })
      )
    );

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    let nodes = wrapper.find(".node");
    const root1 = nodes.at(0);

    const store = wrapper.instance().getStore();
    let onPropertiesLoad = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    root1.simulate("click");
    await onPropertiesLoad;
    wrapper.update();

    expect(storeHasLoadedProperty(store, "root-1")).toBeTruthy();
    // We don't want to track root actors.
    expect(
      store
        .getState()
        .actors.has(gripRepStubs.get("testMoreThanMaxProps").actor)
    ).toBeFalsy();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    nodes = wrapper.find(".node");
    const protoNode = nodes.at(1);

    onPropertiesLoad = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    protoNode.simulate("click");
    await onPropertiesLoad;
    wrapper.update();

    // Once all the loading promises are resolved, actors and loadedProperties
    // should have the expected values.
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    expect(
      storeHasLoadedProperty(store, "Symbol(root-1/<prototype>)")
    ).toBeTruthy();
    expect(store.getState().actors.has(protoStub.prototype.actor)).toBeTruthy();
  });

  it("has the expected state when expanding a proxy node", async () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          injectWaitService: true
        })
      )
    );
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    let nodes = wrapper.find(".node");

    const proxyNode = nodes.at(1);

    const store = wrapper.instance().getStore();
    let onLoadProperties = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    proxyNode.simulate("click");
    await onLoadProperties;
    wrapper.update();

    // Once the properties are loaded, actors and loadedProperties should have
    // the expected values.
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    // We don't want to track root actors.
    expect(
      store.getState().actors.has(gripRepStubs.get("testProxy").actor)
    ).toBeFalsy();

    nodes = wrapper.find(".node");
    const handlerNode = nodes.at(3);
    onLoadProperties = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    handlerNode.simulate("click");
    await onLoadProperties;
    wrapper.update();

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    expect(
      storeHasLoadedProperty(store, "Symbol(root-2/<handler>)")
    ).toBeTruthy();
  });

  it("does not expand if the user selected some text", async () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          injectWaitService: true,
          loadedProperties: new Map([
            ["root-1", gripPropertiesStubs.get("proto-properties-symbols")]
          ])
        })
      )
    );
    const store = wrapper.instance().getStore();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    const nodes = wrapper.find(".node");

    // Set a selection using the mock.
    getSelection().setMockSelection("test");

    const root1 = nodes.at(0);
    root1.simulate("click");
    expect(storeHasExpandedPath(store, "root-1")).toBeFalsy();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    // Clear the selection for other tests.
    getSelection().setMockSelection();
  });

  it("expands if user selected some text and clicked the arrow", async () => {
    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          injectWaitService: true,
          loadedProperties: new Map([
            ["root-1", gripPropertiesStubs.get("proto-properties-symbols")]
          ])
        })
      )
    );
    const store = wrapper.instance().getStore();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
    const nodes = wrapper.find(".node");

    // Set a selection using the mock.
    getSelection().setMockSelection("test");

    const root1 = nodes.at(0);
    root1.find("img.arrow").simulate("click");
    expect(store.getState().expandedPaths.has("root-1")).toBeTruthy();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    // Clear the selection for other tests.
    getSelection().setMockSelection();
  });

  it("does not throw when expanding a block node", async () => {
    const blockNode = createNode({
      name: "Block",
      contents: [
        {
          name: "a",
          contents: {
            value: 30
          }
        },
        {
          name: "b",
          contents: {
            value: 32
          }
        }
      ],
      type: NODE_TYPES.BLOCK
    });
    const proxyNode = createNode({
      name: "Proxy",
      contents: {
        value: gripRepStubs.get("testProxy")
      }
    });

    const wrapper = mount(
      ObjectInspector(
        generateDefaults({
          roots: [blockNode, proxyNode],
          injectWaitService: true
        })
      )
    );
    const store = wrapper.instance().getStore();
    expect(formatObjectInspector(wrapper)).toMatchSnapshot();

    const nodes = wrapper.find(".node");
    const root = nodes.at(0);
    const onPropertiesLoaded = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    root.simulate("click");
    await onPropertiesLoaded;
    wrapper.update();

    expect(formatObjectInspector(wrapper)).toMatchSnapshot();
  });
});
