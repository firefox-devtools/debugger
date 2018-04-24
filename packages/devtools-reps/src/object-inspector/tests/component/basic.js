/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const { createNode, NODE_TYPES } = require("../../utils/node");
const repsPath = "../../../reps";
const { MODE } = require(`${repsPath}/constants`);
const { Rep } = require(`${repsPath}/rep`);
const {
  formatObjectInspector,
  waitForDispatch,
  waitForLoadedProperties
} = require("../test-utils");
const ObjectClient = require("../__mocks__/object-client");
const gripRepStubs = require(`${repsPath}/stubs/grip`);

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 0,
    createObjectClient: grip => ObjectClient(grip),
    ...overrides
  };
}

describe("ObjectInspector - renders", () => {
  it("renders as expected", () => {
    const stub = gripRepStubs.get("testMoreThanMaxProps");

    const renderObjectInspector = mode =>
      mount(
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
            mode
          })
        )
      );
    const renderRep = mode => Rep({ object: stub, mode });

    const tinyOi = renderObjectInspector(MODE.TINY);
    expect(tinyOi.find(".arrow").exists()).toBeTruthy();
    expect(tinyOi.contains(renderRep(MODE.TINY))).toBeTruthy();
    expect(formatObjectInspector(tinyOi)).toMatchSnapshot();

    const shortOi = renderObjectInspector(MODE.SHORT);
    expect(shortOi.find(".arrow").exists()).toBeTruthy();
    expect(shortOi.contains(renderRep(MODE.SHORT))).toBeTruthy();
    expect(formatObjectInspector(shortOi)).toMatchSnapshot();

    const longOi = renderObjectInspector(MODE.LONG);
    expect(longOi.find(".arrow").exists()).toBeTruthy();
    expect(longOi.contains(renderRep(MODE.LONG))).toBeTruthy();
    expect(formatObjectInspector(longOi)).toMatchSnapshot();

    const oi = renderObjectInspector();
    expect(oi.find(".arrow").exists()).toBeTruthy();
    // When no mode is provided, it defaults to TINY mode to render the Rep.
    expect(oi.contains(renderRep(MODE.TINY))).toBeTruthy();
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("directly renders a Rep when the stub is not expandable", () => {
    const object = 42;

    const renderObjectInspector = mode =>
      mount(
        ObjectInspector(
          generateDefaults({
            roots: [
              {
                path: "root",
                contents: {
                  value: object
                }
              }
            ],
            mode
          })
        )
      );
    const renderRep = mode => mount(Rep({ object, mode }));

    const tinyOi = renderObjectInspector(MODE.TINY);
    expect(tinyOi.find(".arrow").exists()).toBeFalsy();
    expect(tinyOi.html()).toEqual(renderRep(MODE.TINY).html());

    const shortOi = renderObjectInspector(MODE.SHORT);
    expect(shortOi.find(".arrow").exists()).toBeFalsy();
    expect(shortOi.html()).toEqual(renderRep(MODE.SHORT).html());

    const longOi = renderObjectInspector(MODE.LONG);
    expect(longOi.find(".arrow").exists()).toBeFalsy();
    expect(longOi.html()).toEqual(renderRep(MODE.LONG).html());

    const oi = renderObjectInspector();
    expect(oi.find(".arrow").exists()).toBeFalsy();
    // When no mode is provided, it defaults to TINY mode to render the Rep.
    expect(oi.html()).toEqual(renderRep(MODE.TINY).html());
  });

  it("renders objects as expected when provided a name", () => {
    const object = gripRepStubs.get("testMoreThanMaxProps");
    const name = "myproperty";

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              name,
              contents: {
                value: object
              }
            }
          ],
          mode: MODE.SHORT
        })
      )
    );

    expect(oi.find(".object-label").text()).toEqual(name);
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("renders primitives as expected when provided a name", () => {
    const value = 42;
    const name = "myproperty";

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              name,
              contents: { value }
            }
          ],
          mode: MODE.SHORT
        })
      )
    );

    expect(oi.find(".object-label").text()).toEqual(name);
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("renders as expected when not provided a name", () => {
    const object = gripRepStubs.get("testMoreThanMaxProps");

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              contents: {
                value: object
              }
            }
          ],
          mode: MODE.SHORT
        })
      )
    );

    expect(oi.find(".object-label").exists()).toBeFalsy();
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("renders leaves with a shorter mode than the root", async () => {
    const stub = gripRepStubs.get("testMaxProps");

    const renderObjectInspector = mode =>
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
            mode,
            loadedProperties: new Map([
              [
                "root",
                {
                  ownProperties: Object.keys(stub.preview.ownProperties).reduce(
                    (res, key) => ({
                      [key]: {
                        value: stub
                      },
                      ...res
                    }),
                    {}
                  )
                }
              ]
            ])
          })
        )
      );

    const renderRep = mode => Rep({ object: stub, mode });

    const tinyOi = renderObjectInspector(MODE.TINY);
    expect(
      tinyOi
        .find(".node")
        .at(1)
        .contains(renderRep(MODE.TINY))
    ).toBeTruthy();

    const shortOi = renderObjectInspector(MODE.SHORT);
    expect(
      shortOi
        .find(".node")
        .at(1)
        .contains(renderRep(MODE.TINY))
    ).toBeTruthy();

    const longOi = renderObjectInspector(MODE.LONG);
    expect(
      longOi
        .find(".node")
        .at(1)
        .contains(renderRep(MODE.SHORT))
    ).toBeTruthy();

    const oi = renderObjectInspector();
    // When no mode is provided, it defaults to TINY mode to render the Rep.
    expect(
      oi
        .find(".node")
        .at(1)
        .contains(renderRep(MODE.TINY))
    ).toBeTruthy();
  });

  it("renders less-important nodes as expected", async () => {
    const defaultPropertiesNode = createNode({
      name: "<default>",
      contents: [],
      type: NODE_TYPES.DEFAULT_PROPERTIES
    });

    // The <default properties> node should have the "lessen" class only when
    // collapsed.
    let oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [defaultPropertiesNode],
          injectWaitService: true
        })
      )
    );
    let store = oi.instance().getStore();

    let defaultPropertiesElementNode = oi.find(".node");
    expect(defaultPropertiesElementNode.hasClass("lessen")).toBe(true);

    let onPropertiesLoaded = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    defaultPropertiesElementNode.simulate("click");
    await onPropertiesLoaded;
    oi.update();
    defaultPropertiesElementNode = oi.find(".node").first();
    expect(
      oi
        .find(".node")
        .first()
        .hasClass("lessen")
    ).toBe(false);

    const prototypeNode = createNode({
      name: "<prototype>",
      contents: [],
      type: NODE_TYPES.PROTOTYPE
    });

    // The <prototype> node should have the "lessen" class only when collapsed.
    oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [prototypeNode],
          injectWaitService: true
        })
      )
    );
    store = oi.instance().getStore();

    let protoElementNode = oi.find(".node");
    expect(protoElementNode.hasClass("lessen")).toBe(true);

    onPropertiesLoaded = waitForDispatch(store, "NODE_PROPERTIES_LOADED");
    protoElementNode.simulate("click");
    await onPropertiesLoaded;
    oi.update();

    protoElementNode = oi.find(".node").first();
    expect(protoElementNode.hasClass("lessen")).toBe(false);
  });

  it("renders block nodes as expected", async () => {
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

    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [blockNode],
          autoExpandDepth: 1
        })
      )
    );

    await waitForLoadedProperties(oi.instance().getStore(), ["Symbol(Block)"]);
    oi.update();

    const blockElementNode = oi.find(".node").first();
    expect(blockElementNode.hasClass("block")).toBe(true);
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("updates when the root changes", async () => {
    let root = {
      path: "root",
      contents: {
        value: gripRepStubs.get("testMoreThanMaxProps")
      }
    };
    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [root],
          mode: MODE.LONG,
          focusedItem: root,
          injectWaitService: true
        })
      )
    );

    expect(formatObjectInspector(oi)).toMatchSnapshot();

    root = {
      path: "root-2",
      contents: {
        value: gripRepStubs.get("testMaxProps")
      }
    };

    const onComponentUpdated = waitForDispatch(
      oi.instance().getStore(),
      "FORCE_UPDATED"
    );
    oi.setProps({
      roots: [root],
      focusedItem: root
    });
    await onComponentUpdated;
    oi.update();
    expect(formatObjectInspector(oi)).toMatchSnapshot();
  });

  it("updates when the root changes but has same path", async () => {
    const oi = mount(
      ObjectInspector(
        generateDefaults({
          roots: [
            {
              path: "root",
              name: "root",
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
              ]
            }
          ],
          mode: MODE.LONG,
          injectWaitService: true
        })
      )
    );
    oi
      .find(".node")
      .at(0)
      .simulate("click");
    const oldTree = formatObjectInspector(oi);

    const onComponentUpdated = waitForDispatch(
      oi.instance().getStore(),
      "FORCE_UPDATED"
    );
    oi.setProps({
      roots: [
        {
          path: "root",
          name: "root",
          contents: [
            {
              name: "c",
              contents: {
                value: "i'm the new node"
              }
            }
          ]
        }
      ]
    });

    await onComponentUpdated;
    oi.update();
    expect(formatObjectInspector(oi)).not.toBe(oldTree);
  });
});
