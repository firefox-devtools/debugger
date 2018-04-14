/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { mount, shallow } from "enzyme";

import ManagedTree from "../ManagedTree";

describe("ManagedTree", () => {
  const testTree = {
    a: {
      value: "FOO",
      children: [
        { value: 1 },
        { value: 2 },
        { value: 3 },
        { value: 4 },
        { value: 5 }
      ]
    },
    b: {
      value: "BAR",
      children: [
        { value: "A" },
        { value: "B" },
        { value: "C" },
        { value: "D" },
        { value: "E" }
      ]
    },
    c: { value: "BAZ" }
  };
  const renderItem = item => <div>{item.value ? item.value : item}</div>;
  const onFocus = jest.fn();
  const onExpand = jest.fn();
  const onCollapse = jest.fn();
  const getPath = (item, i) => {
    if (item.value) {
      return item.value;
    }
    if (i) {
      return i;
    }
    return `${item}-$`;
  };
  const tree = shallow(
    <ManagedTree
      getRoots={() => Object.keys(testTree)}
      getParent={item => null}
      getChildren={branch => branch.children || []}
      itemHeight={24}
      autoExpandAll={true}
      autoExpandDepth={1}
      getPath={getPath}
      renderItem={renderItem}
      onFocus={onFocus}
      onExpand={onExpand}
      onCollapse={onCollapse}
    />
  );
  beforeEach(() => {
    onFocus.mockClear();
    onExpand.mockClear();
    onCollapse.mockClear();
  });
  it("render", () => expect(tree).toMatchSnapshot());
  it("expands list items", () => {
    tree.setProps({
      listItems: testTree.b.children
    });
    expect(tree).toMatchSnapshot();
  });
  it("highlights list items", () => {
    tree.setProps({
      highlightItems: testTree.a.children
    });
    expect(tree).toMatchSnapshot();
  });
  it("focuses list items", () => {
    tree.setProps({ focused: testTree.a });
    expect(tree).toMatchSnapshot();
    expect(tree.state().focusedItem).toEqual(testTree.a);
    expect(onFocus).toHaveBeenCalledWith(testTree.a);
  });
  it("sets expanded items", () => {
    const mountedTree = mount(
      <ManagedTree
        getRoots={() => Object.keys(testTree)}
        getParent={item => null}
        getChildren={branch => branch.children || []}
        itemHeight={24}
        autoExpandAll={true}
        autoExpandDepth={1}
        getPath={getPath}
        renderItem={renderItem}
        onFocus={onFocus}
        onExpand={onExpand}
        onCollapse={onCollapse}
      />
    );
    expect(mountedTree).toMatchSnapshot();
    mountedTree
      .find("TreeNode")
      .first()
      .simulate("click");
    expect(mountedTree).toMatchSnapshot();
    expect(onExpand).toHaveBeenCalledWith(
      "c",
      new Set(Object.keys(testTree).map(k => `${k}-$`))
    );
  });
});
