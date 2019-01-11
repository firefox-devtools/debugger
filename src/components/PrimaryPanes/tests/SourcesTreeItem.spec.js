/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import { showMenu } from "devtools-contextmenu";

import SourcesTreeItem from "../SourcesTreeItem";
import { createSource } from "../../../reducers/sources";
import { copyToTheClipboard } from "../../../utils/clipboard";

jest.mock("devtools-contextmenu", () => ({ showMenu: jest.fn() }));
jest.mock("../../../utils/clipboard", () => ({
  copyToTheClipboard: jest.fn()
}));

describe("SourceTreeItem", () => {
  afterEach(() => {
    copyToTheClipboard.mockClear();
    showMenu.mockClear();
  });

  it("should show menu on contextmenu of an item", async () => {
    const { instance, component } = render();
    const { item } = instance.props;
    instance.onContextMenu = jest.fn(() => {});

    const event = { event: "contextmenu" };
    component.simulate("contextmenu", event);
    expect(instance.onContextMenu).toHaveBeenCalledWith(event, item);
  });

  describe("onContextMenu of the tree", () => {
    it("shows context menu on directory to set as root", async () => {
      const menuOptions = [
        {
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-collapse-all",
          label: "Collapse all"
        },
        {
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-expand-all",
          label: "Expand all"
        },
        {
          accesskey: "r",
          click: expect.any(Function),
          disabled: false,
          id: "node-set-directory-root",
          label: "Set directory root"
        }
      ];
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const { props, instance } = render({
        projectRoot: "root/"
      });
      await instance.onContextMenu(mockEvent, createMockDirectory());
      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][2].click();
      expect(props.setProjectDirectoryRoot).toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(copyToTheClipboard).not.toHaveBeenCalled();
    });

    it("shows context menu on file to copy source uri", async () => {
      const menuOptions = [
        {
          accesskey: "u",
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-copy-source",
          label: "Copy source URI"
        }
      ];
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };
      const { props, instance } = render({
        projectRoot: "root/"
      });
      const { item } = instance.props;

      await instance.onContextMenu(mockEvent, item);

      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(props.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(copyToTheClipboard).toHaveBeenCalled();
    });

    it("shows context menu on root to remove directory root", async () => {
      const menuOptions = [
        {
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-collapse-all",
          label: "Collapse all"
        },
        {
          click: expect.any(Function),
          disabled: false,
          id: "node-menu-expand-all",
          label: "Expand all"
        },
        {
          click: expect.any(Function),
          disabled: false,
          id: "node-remove-directory-root",
          label: "Remove directory root"
        }
      ];
      const { props, instance } = render({
        projectRoot: "root/"
      });

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      };

      await instance.onContextMenu(
        mockEvent,
        createMockDirectory("root/", "root")
      );

      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][2].click();
      expect(props.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).toHaveBeenCalled();
      expect(copyToTheClipboard).not.toHaveBeenCalled();
    });
  });

  describe("renderItem", () => {
    it("should show icon for webpack item", async () => {
      const item = createMockDirectory("webpack://", "webpack://");
      const node = render({ item });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for angular item", async () => {
      const item = createMockDirectory("ng://", "ng://");
      const node = render({ item });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for moz-extension item", async () => {
      const item = createMockDirectory(
        "moz-extension://e37c3c08-beac-a04b-8032-c4f699a1a856",
        "moz-extension://e37c3c08-beac-a04b-8032-c4f699a1a856"
      );
      const node = render({ item, depth: 0 });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with arrow", async () => {
      const item = createMockDirectory();
      const node = render({ item, source: null });
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with expanded arrow", async () => {
      const node = render({
        item: createMockDirectory(),
        source: null,
        depth: 1,
        focused: false,
        expanded: true
      });
      expect(node).toMatchSnapshot();
    });

    it("should show focused item for folder with expanded arrow", async () => {
      const node = render({
        item: createMockDirectory(),
        source: null,
        depth: 1,
        focused: true,
        expanded: true
      });
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon", async () => {
      const node = render({ item: createMockItem() });
      expect(node).toMatchSnapshot();
    });

    it("should show (mapped) for duplicate source items", async () => {
      const node = render({
        item: createMockItem(),
        hasMatchingGeneratedSource: true
      });
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon with focus", async () => {
      const node = render({
        depth: 1,
        focused: true,
        expanded: false
      });
      expect(node).toMatchSnapshot();
    });

    it("should show domain item", async () => {
      const node = render({
        item: createMockItem({ name: "root", path: "root" }),
        depth: 0
      });
      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee", async () => {
      const node = render({
        item: createMockDirectory("root", "http://mdn.com"),
        depth: 0
      });

      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee with focus and arrow", async () => {
      const node = render({
        item: createMockDirectory("root", "http://mdn.com"),
        depth: 0,
        focused: true
      });

      expect(node).toMatchSnapshot();
    });

    it("should not show domain item when the projectRoot exists", async () => {
      const { node } = render({
        projectRoot: "root/"
      });
      expect(node).toMatchSnapshot();
    });

    it("should focus on and select item on click", async () => {
      const event = { event: "click" };
      const selectItem = jest.fn();
      const { component, instance, props } = render({
        depth: 1,
        focused: true,
        expanded: false,
        selectItem
      });

      const { item } = instance.props;
      component.simulate("click", event);
      await component.simulate("keydown", { keyCode: 13 });
      expect(props.selectItem).toHaveBeenCalledWith(item);
    });

    it("should focus on directory on click", async () => {
      const selectItem = jest.fn();

      const { component, props } = render({
        item: createMockDirectory(),
        source: null,
        depth: 1,
        focused: true,
        expanded: false,
        selectItem
      });

      component.simulate("click", { event: "click" });
      expect(props.selectItem).not.toHaveBeenCalled();
    });
  });
});

function generateDefaults(overrides) {
  const source = createSource({
    id: "server1.conn13.child1/39",
    url: "http://mdn.com/one.js"
  });

  const item = {
    name: "one.js",
    path: "mdn.com/one.js",
    contents: source
  };

  return {
    expanded: false,
    item,
    source,
    debuggeeUrl: "http://mdn.com",
    projectRoot: "",
    clearProjectDirectoryRoot: jest.fn(),
    setProjectDirectoryRoot: jest.fn(),
    selectItem: jest.fn(),
    focusItem: jest.fn(),
    setExpanded: jest.fn(),
    ...overrides
  };
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<SourcesTreeItem.WrappedComponent {...props} />);
  const defaultState = component.state();
  const instance = component.instance();

  return { component, props, defaultState, instance };
}

function createMockDirectory(path = "folder/", name = "folder", contents = []) {
  return {
    type: "directory",
    name,
    path,
    contents
  };
}

function createMockItem(overrides = {}) {
  overrides.contents = createSource({
    id: "server1.conn13.child1/39",
    ...(overrides.contents || {})
  });

  return {
    type: "source",
    name: "one.js",
    path: "http://mdn.com/one.js",
    ...overrides
  };
}
