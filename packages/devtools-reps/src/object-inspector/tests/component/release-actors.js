/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* global jest */

const { mount } = require("enzyme");
const React = require("react");
const { createFactory } = React;
const ObjectInspector = createFactory(require("../../index"));
const repsPath = "../../../reps";
const gripRepStubs = require(`${repsPath}/stubs/grip`);
const ObjectClient = require("../__mocks__/object-client");
const stub = gripRepStubs.get("testMoreThanMaxProps");
const { waitForDispatch } = require("../test-utils");

function generateDefaults(overrides) {
  return {
    autoExpandDepth: 0,
    roots: [
      {
        path: "root",
        contents: {
          value: stub
        }
      }
    ],
    createObjectClient: grip => ObjectClient(grip),
    ...overrides
  };
}

describe("release actors", () => {
  it("calls release actors when unmount", () => {
    const releaseActor = jest.fn();
    const props = generateDefaults({
      releaseActor,
      actors: new Set(["actor 1", "actor 2"])
    });
    const oi = ObjectInspector(props);
    const wrapper = mount(oi);
    wrapper.unmount();

    expect(releaseActor.mock.calls).toHaveLength(2);
    expect(releaseActor.mock.calls[0][0]).toBe("actor 1");
    expect(releaseActor.mock.calls[1][0]).toBe("actor 2");
  });

  it("calls release actors when the roots prop changed", async () => {
    const releaseActor = jest.fn();
    const props = generateDefaults({
      releaseActor,
      actors: new Set(["actor 1", "actor 2"]),
      injectWaitService: true
    });
    const oi = ObjectInspector(props);
    const wrapper = mount(oi);
    const store = wrapper.instance().getStore();

    const onRootsChanged = waitForDispatch(store, "ROOTS_CHANGED");
    wrapper.setProps({
      roots: [
        {
          path: "root-2",
          contents: {
            value: gripRepStubs.get("testMaxProps")
          }
        }
      ]
    });

    await onRootsChanged;

    expect(releaseActor.mock.calls).toHaveLength(2);
    expect(releaseActor.mock.calls[0][0]).toBe("actor 1");
    expect(releaseActor.mock.calls[1][0]).toBe("actor 2");
  });
});
