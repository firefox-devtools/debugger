/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import SourcesTree from "../../components/PrimaryPanes/SourcesTree";
import * as I from "immutable";

function generateDefaults(overrides) {
  return {
    autoExpandAll: true,
    selectLocation: jest.fn(),
    setExpandedState: jest.fn(),
    sources: I.Map({
      "server1.conn13.child1/39": createMockSource(
        "server1.conn13.child1/39",
        "http://mdn.com/one.js"
      ),
      "server1.conn13.child1/40": createMockSource(
        "server1.conn13.child1/40",
        "http://mdn.com/two.js"
      ),
      "server1.conn13.child1/41": createMockSource(
        "server1.conn13.child1/41",
        "http://mdn.com/three.js"
      )
    }),
    debuggeeUrl: "http://mdn.com",
    projectRoot: "",
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<SourcesTree.WrappedComponent {...props} />);

  component.instance().shouldComponentUpdate = () => true;

  return { component, props };
}

function createMockSource(id, url) {
  return I.Map({
    id: id,
    url: url,
    isPrettyPrinted: false,
    isWasm: false,
    sourceMapURL: null,
    isBlackBoxed: false,
    loadedState: "unloaded"
  });
}

describe("SourcesTree", () => {
  it("Should show the tree with nothing expanded", async () => {
    const { component } = render();

    expect(component).toMatchSnapshot();
  });

  describe("When loading initial source", () => {
    it("Shows the tree with one.js, two.js and three.js expanded", async () => {
      const { component, props } = render({});

      await component.setProps({
        ...props,
        expanded: ["one.js", "two.js", "three.js"]
      });

      expect(component).toMatchSnapshot();
    });
  });

  describe("After changing expanded nodes", () => {
    it("Shows the tree with four.js, five.js and six.js expanded", async () => {
      const { component, props } = render({});

      await component.setProps({
        ...props,
        expanded: ["four.js", "five.js", "six.js"]
      });

      expect(component).toMatchSnapshot();
    });
  });
});
