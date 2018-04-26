/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global jest */

const { shallow } = require("enzyme");
const {
  getRep,
} = require("../rep");
const GripMap = require("../grip-map");
const { MODE } = require("../constants");
const stubs = require("../stubs/grip-map");
const {
  expectActorAttribute,
  getSelectableInInspectorGrips,
  getMapLengthBubbleText,
} = require("./test-helpers");
const {maxLengthMap} = GripMap;

function shallowRenderRep(object, props = {}) {
  return shallow(GripMap.rep({
    object,
    ...props,
  }));
}

describe("GripMap - empty map", () => {
  const object = stubs.get("testEmptyMap");

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    let length = getMapLengthBubbleText(object);
    const defaultOutput = `Map${length}`;

    let component = renderRep({ mode: undefined });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.TINY });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.SHORT });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);

    component = renderRep({ mode: MODE.LONG });
    expect(component.text()).toBe(defaultOutput);
    expectActorAttribute(component, object.actor);
  });
});

describe("GripMap - Symbol-keyed Map", () => {
  // Test object:
  // `new Map([[Symbol("a"), "value-a"], [Symbol("b"), "value-b"]])`
  const object = stubs.get("testSymbolKeyedMap");

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    let length = getMapLengthBubbleText(object);
    const defaultOutput = `Map${length} { Symbol(a) → "value-a", Symbol(b) → "value-b" }`;

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.TINY });
    expect(renderRep({ mode: MODE.TINY }).text()).toBe(`Map${length}`);

    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);
  });
});

describe("GripMap - WeakMap", () => {
  // Test object: `new WeakMap([[{a: "key-a"}, "value-a"]])`
  const object = stubs.get("testWeakMap");

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    let length = getMapLengthBubbleText(object);
    const defaultOutput = `WeakMap${length} { {…} → "value-a" }`;
    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.TINY });
    expect(renderRep({ mode: MODE.TINY }).text()).toBe(`WeakMap${length}`);

    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.LONG });
    expect(renderRep({
      mode: MODE.LONG,
      title: "CustomTitle"
    }).text()).toBe(`CustomTitle${length} { {…} → "value-a" }`);
  });
});

describe("GripMap - max entries", () => {
  // Test object:
  // `new Map([["key-a","value-a"], ["key-b","value-b"], ["key-c","value-c"]])`
  const object = stubs.get("testMaxEntries");

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("renders as expected", () => {
    let length = getMapLengthBubbleText(object);
    const renderRep = (props) => shallowRenderRep(object, props);
    const defaultOutput =
      `Map${length} { "key-a" → "value-a", "key-b" → "value-b", "key-c" → "value-c" }`;

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.TINY });
    expect(renderRep({ mode: MODE.TINY }).text()).toBe(`Map${length}`);

    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(defaultOutput);
  });
});

describe("GripMap - more than max entries", () => {
  // Test object = `new Map(
  //   [["key-0", "value-0"], ["key-1", "value-1"]], …, ["key-100", "value-100"]]}`
  const object = stubs.get("testMoreThanMaxEntries");

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    let length = getMapLengthBubbleText(object);
    const defaultOutput = `Map${length} { "key-0" → "value-0", ` +
      `"key-1" → "value-1", "key-2" → "value-2", … }`;

    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.TINY });
    expect(renderRep({ mode: MODE.TINY }).text()).toBe(`Map${length}`);

    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);

    let longString = Array.from({length: maxLengthMap.get(MODE.LONG)})
      .map((_, i) => `"key-${i}" → "value-${i}"`);
    expect(renderRep({ mode: MODE.LONG }).text())
      .toBe(`Map(${maxLengthMap.get(MODE.LONG) + 1}) { ${longString.join(", ")}, … }`);
  });
});

describe("GripMap - uninteresting entries", () => {
  // Test object:
  // `new Map([["key-a",null], ["key-b",undefined], ["key-c","value-c"], ["key-d",4]])`
  const object = stubs.get("testUninterestingEntries");

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("renders as expected", () => {
    const renderRep = (props) => shallowRenderRep(object, props);
    let length = getMapLengthBubbleText(object);
    const defaultOutput =
      `Map${length} { "key-a" → null, "key-c" → "value-c", "key-d" → 4, … }`;
    expect(renderRep({ mode: undefined }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.TINY });
    expect(renderRep({ mode: MODE.TINY }).text()).toBe(`Map${length}`);

    expect(renderRep({ mode: MODE.SHORT }).text()).toBe(defaultOutput);

    length = getMapLengthBubbleText(object, { mode: MODE.LONG });
    const longOutput = `Map${length} { "key-a" → null, "key-b" → undefined, ` +
      `"key-c" → "value-c", "key-d" → 4 }`;
    expect(renderRep({ mode: MODE.LONG }).text()).toBe(longOutput);
  });
});

describe("GripMap - Node-keyed entries", () => {
  const object = stubs.get("testNodeKeyedMap");
  const renderRep = (props) => shallowRenderRep(object, props);
  const grips = getSelectableInInspectorGrips(object);

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("has the expected number of grips", () => {
    expect(grips.length).toBe(3);
  });

  it("calls the expected function on mouseover", () => {
    const onDOMNodeMouseOver = jest.fn();
    const wrapper = renderRep({ onDOMNodeMouseOver });
    const node = wrapper.find(".objectBox-node");

    node.at(0).simulate("mouseover");
    node.at(1).simulate("mouseover");
    node.at(2).simulate("mouseover");

    expect(onDOMNodeMouseOver.mock.calls.length).toBe(3);
    expect(onDOMNodeMouseOver.mock.calls[0][0]).toBe(grips[0]);
    expect(onDOMNodeMouseOver.mock.calls[1][0]).toBe(grips[1]);
    expect(onDOMNodeMouseOver.mock.calls[2][0]).toBe(grips[2]);
  });

  it("calls the expected function on mouseout", () => {
    const onDOMNodeMouseOut = jest.fn();
    const wrapper = renderRep({ onDOMNodeMouseOut });
    const node = wrapper.find(".objectBox-node");

    node.at(0).simulate("mouseout");
    node.at(1).simulate("mouseout");
    node.at(2).simulate("mouseout");

    expect(onDOMNodeMouseOut.mock.calls.length).toBe(3);
  });

  it("calls the expected function on click", () => {
    const onInspectIconClick = jest.fn();
    const wrapper = renderRep({ onInspectIconClick });
    const node = wrapper.find(".open-inspector");

    node.at(0).simulate("click");
    node.at(1).simulate("click");
    node.at(2).simulate("click");

    expect(onInspectIconClick.mock.calls.length).toBe(3);
    expect(onInspectIconClick.mock.calls[0][0]).toBe(grips[0]);
    expect(onInspectIconClick.mock.calls[1][0]).toBe(grips[1]);
    expect(onInspectIconClick.mock.calls[2][0]).toBe(grips[2]);
  });
});

describe("GripMap - Node-valued entries", () => {
  const object = stubs.get("testNodeValuedMap");
  const renderRep = (props) => shallowRenderRep(object, props);
  const grips = getSelectableInInspectorGrips(object);

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("has the expected number of grips", () => {
    expect(grips.length).toBe(3);
  });

  it("calls the expected function on mouseover", () => {
    const onDOMNodeMouseOver = jest.fn();
    const wrapper = renderRep({ onDOMNodeMouseOver });
    const node = wrapper.find(".objectBox-node");

    node.at(0).simulate("mouseover");
    node.at(1).simulate("mouseover");
    node.at(2).simulate("mouseover");

    expect(onDOMNodeMouseOver.mock.calls.length).toBe(3);
    expect(onDOMNodeMouseOver.mock.calls[0][0]).toBe(grips[0]);
    expect(onDOMNodeMouseOver.mock.calls[1][0]).toBe(grips[1]);
    expect(onDOMNodeMouseOver.mock.calls[2][0]).toBe(grips[2]);
  });

  it("calls the expected function on mouseout", () => {
    const onDOMNodeMouseOut = jest.fn();
    const wrapper = renderRep({ onDOMNodeMouseOut });
    const node = wrapper.find(".objectBox-node");

    node.at(0).simulate("mouseout");
    node.at(1).simulate("mouseout");
    node.at(2).simulate("mouseout");

    expect(onDOMNodeMouseOut.mock.calls.length).toBe(3);
  });

  it("calls the expected function on click", () => {
    const onInspectIconClick = jest.fn();
    const wrapper = renderRep({ onInspectIconClick });
    const node = wrapper.find(".open-inspector");

    node.at(0).simulate("click");
    node.at(1).simulate("click");
    node.at(2).simulate("click");

    expect(onInspectIconClick.mock.calls.length).toBe(3);
    expect(onInspectIconClick.mock.calls[0][0]).toBe(grips[0]);
    expect(onInspectIconClick.mock.calls[1][0]).toBe(grips[1]);
    expect(onInspectIconClick.mock.calls[2][0]).toBe(grips[2]);
  });
});

describe("GripMap - Disconnected node-valued entries", () => {
  const object = stubs.get("testDisconnectedNodeValuedMap");
  const renderRep = (props) => shallowRenderRep(object, props);
  const grips = getSelectableInInspectorGrips(object);

  it("correctly selects GripMap Rep", () => {
    expect(getRep(object)).toBe(GripMap.rep);
  });

  it("has the expected number of grips", () => {
    expect(grips.length).toBe(3);
  });

  it("renders no inspect icon when nodes are not connected to the DOM tree", () => {
    const onInspectIconClick = jest.fn();
    const wrapper = renderRep({ onInspectIconClick });

    const node = wrapper.find(".open-inspector");
    expect(node.exists()).toBe(false);
  });
});
