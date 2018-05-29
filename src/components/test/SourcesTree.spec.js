/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import SourcesTree from "../../components/PrimaryPanes/SourcesTree";
import * as I from "immutable";
import { showMenu } from "devtools-contextmenu";
import { copyToTheClipboard } from "../../utils/clipboard";

jest.mock("devtools-contextmenu", () => ({ showMenu: jest.fn() }));
jest.mock("../../utils/clipboard", () => ({ copyToTheClipboard: jest.fn() }));

describe("SourcesTree", () => {
  afterEach(() => {
    copyToTheClipboard.mockClear();
    showMenu.mockClear();
  });

  it("Should show the tree with nothing expanded", async () => {
    const { component } = render();
    expect(component).toMatchSnapshot();
  });

  describe("When loading initial source", () => {
    it("Shows the tree with one.js, two.js and three.js expanded", async () => {
      const { component, props } = render();
      await component.setProps({
        ...props,
        expanded: ["one.js", "two.js", "three.js"]
      });

      expect(component).toMatchSnapshot();
    });
  });

  describe("After changing expanded nodes", () => {
    it("Shows the tree with four.js, five.js and six.js expanded", async () => {
      const { component, props } = render();
      await component.setProps({
        ...props,
        expanded: ["four.js", "five.js", "six.js"]
      });

      expect(component).toMatchSnapshot();
    });
  });

  describe("on receiving new props", () => {
    describe("recreates tree", () => {
      it("does not recreate tree if no new source is added", async () => {
        const { component, props, defaultState } = render();
        const mockSource = I.Map({
          "server1.conn13.child1/41": createMockSource(
            "server1.conn13.child1/41",
            "http://mdn.com/three.js"
          )
        });

        await component.setProps({
          ...props,
          sources: mockSource
        });

        expect(component.state("uncollapsedTree")).toEqual(
          defaultState.uncollapsedTree
        );
      });

      it("updates tree with a new item", async () => {
        const { component, props } = render();
        const newSource = createMockSource(
          "server1.conn13.child1/42",
          "http://mdn.com/four.js",
          true
        );

        const sources = props.sources.set(
          "server1.conn13.child1/42",
          newSource
        );

        await component.setProps({
          ...props,
          sources: sources
        });

        expect(
          component.state("uncollapsedTree").contents[0].contents
        ).toHaveLength(4);
      });

      it("updates sources if sources are emptied", async () => {
        const { component, props, defaultState } = render();

        expect(defaultState.uncollapsedTree.contents).toHaveLength(1);

        await component.setProps({
          ...props,
          sources: I.Map({})
        });

        expect(component.state("uncollapsedTree").contents).toHaveLength(0);
      });

      it("recreates tree if projectRoot is changed", async () => {
        const { component, props, defaultState } = render();
        const sources = I.Map({
          "server1.conn13.child1/41": createMockSource(
            "server1.conn13.child1/41",
            "http://mozilla.com/three.js"
          )
        });

        expect(defaultState.uncollapsedTree.contents[0].contents).toHaveLength(
          3
        );

        await component.setProps({
          ...props,
          sources: sources,
          projectRoot: "mozilla"
        });

        expect(
          component.state("uncollapsedTree").contents[0].contents
        ).toHaveLength(1);
      });

      it("recreates tree if debugeeUrl is changed", async () => {
        const { component, props, defaultState } = render();
        const mockSource = I.Map({
          "server1.conn13.child1/41": createMockSource(
            "server1.conn13.child1/41",
            "http://mdn.com/three.js"
          )
        });

        expect(defaultState.uncollapsedTree.contents[0].contents).toHaveLength(
          3
        );

        await component.setProps({
          ...props,
          debuggeeUrl: "mozilla",
          sources: mockSource
        });

        expect(
          component.state("uncollapsedTree").contents[0].contents
        ).toHaveLength(1);
      });
    });

    describe("updates list items", () => {
      it("updates list items if shownSource changes", async () => {
        const { component, props } = render();
        await component.setProps({
          ...props,
          shownSource: "http://mdn.com/three.js"
        });
        expect(component).toMatchSnapshot();
        expect(props.selectSource).toHaveBeenCalledWith(
          "server1.conn13.child1/41"
        );
      });
    });

    describe("updates highlighted items", () => {
      it("updates highlightItems if selectedSource changes", async () => {
        const { component, props } = render();
        const mockSource = I.Map({
          "server1.conn13.child1/41": createMockSource(
            "server1.conn13.child1/41",
            "http://mdn.com/three.js"
          )
        });
        await component.setProps({
          ...props,
          selectedSource: mockSource
        });
        expect(component).toMatchSnapshot();
      });
    });
  });

  describe("focusItem", () => {
    it("update the focused item", async () => {
      const { component, instance, props } = render();
      const item = createMockItem();
      await instance.focusItem(item);
      await component.update();
      await component
        .find(".sources-list")
        .simulate("keydown", { keyCode: 13 });
      expect(props.selectSource).toHaveBeenCalledWith(item.contents.id);
    });
  });

  describe("with custom root", () => {
    it("renders custom root source list", async () => {
      const { component } = render({
        projectRoot: "mdn.com"
      });
      expect(component).toMatchSnapshot();
    });

    it("calls clearProjectDirectoryRoot on click", async () => {
      const { component, props } = render({
        projectRoot: "mdn"
      });
      component.find(".sources-clear-root").simulate("click");
      expect(props.clearProjectDirectoryRoot).toHaveBeenCalled();
    });

    it("renders empty custom root source list", async () => {
      const { component } = render({
        projectRoot: "custom",
        sources: I.Map()
      });
      expect(component).toMatchSnapshot();
    });
  });

  describe("onContextMenu of the tree", () => {
    it("shows context menu on directory to set as root", async () => {
      const menuOptions = [
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

      showMenu.mock.calls[0][1][0].click();
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
      await instance.onContextMenu(mockEvent, createMockItem());
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

      showMenu.mock.calls[0][1][0].click();
      expect(props.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(props.clearProjectDirectoryRoot).toHaveBeenCalled();
      expect(copyToTheClipboard).not.toHaveBeenCalled();
    });
  });

  describe("renderItem", () => {
    it("should show icon for webpack item", async () => {
      const { instance } = render();
      const item = createMockDirectory("webpack://", "webpack://");
      const node = renderItem(instance, item);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for angular item", async () => {
      const { instance } = render();
      const item = createMockDirectory("ng://", "ng://");
      const node = renderItem(instance, item);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for moz-extension item", async () => {
      const { instance } = render();
      const item = createMockDirectory("moz-extension://", "moz-extension://");
      const node = renderItem(instance, item);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with arrow", async () => {
      const { instance } = render();
      const node = renderItem(instance, createMockDirectory());
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with expanded arrow", async () => {
      const { instance } = render();
      const node = renderItem(instance, createMockDirectory(), 1, false, true);
      expect(node).toMatchSnapshot();
    });

    it("should show focused item for folder with expanded arrow", async () => {
      const { instance } = render();
      const node = renderItem(instance, createMockDirectory(), 1, true, true);
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon", async () => {
      const { instance } = render();
      const node = renderItem(instance, createMockItem());
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon with focus", async () => {
      const { instance } = render();
      const node = renderItem(instance, createMockItem(), 1, true, false);
      expect(node).toMatchSnapshot();
    });

    it("should show domain item", async () => {
      const { instance } = render();
      const item = createMockItem("root", "root");
      const node = renderItem(instance, item, 0);
      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee", async () => {
      const { instance } = render();
      const item = createMockItem("root", "http://mdn.com");
      const node = renderItem(instance, item, 0);
      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee with focus and arrow", async () => {
      const { instance } = render();
      const item = createMockDirectory("root", "http://mdn.com");
      const node = renderItem(instance, item, 0, true);
      expect(node).toMatchSnapshot();
    });

    it("should not show domain item when the projectRoot exists", async () => {
      const { instance } = render({
        projectRoot: "root/"
      });
      const node = renderItem(instance, createMockItem(), 0);
      expect(node).toMatchSnapshot();
    });

    it("should show menu on contextmenu of an item", async () => {
      const { instance } = render();
      const item = createMockItem();
      instance.onContextMenu = jest.fn(() => {});
      const event = { event: "contextmenu" };
      const node = shallow(renderItem(instance, item, 1, true));

      node.simulate("contextmenu", event);
      expect(instance.onContextMenu).toHaveBeenCalledWith(event, item);
    });

    it("should focus on and select item on click", async () => {
      const { component, instance, props } = render();
      const item = createMockItem();
      const event = { event: "click" };
      const setExpanded = jest.fn();
      const node = shallow(
        renderItem(instance, item, 1, true, false, setExpanded)
      );

      node.simulate("click", event);

      await component
        .find(".sources-list")
        .simulate("keydown", { keyCode: 13 });
      expect(props.selectSource).toHaveBeenCalledWith(item.contents.id);
      expect(setExpanded).not.toHaveBeenCalled();
    });

    it("should focus on and expand directory on click", async () => {
      const { component, instance, props } = render();
      const event = { event: "click" };
      const setExpanded = jest.fn();
      const mockDirectory = createMockDirectory();
      const node = shallow(
        renderItem(instance, mockDirectory, 1, true, false, setExpanded)
      );

      node.simulate("click", event);

      expect(component.state("focusedItem")).toEqual(mockDirectory);
      expect(setExpanded).toHaveBeenCalled();
      expect(props.selectSource).not.toHaveBeenCalledWith();
    });
  });

  describe("selectItem", () => {
    it("should select item with no children", async () => {
      const { instance, props } = render();
      instance.selectItem(createMockItem());
      expect(props.selectSource).toHaveBeenCalledWith(
        "server1.conn13.child1/39"
      );
    });

    it("should not select item with children", async () => {
      const { props, instance } = render();
      instance.selectItem(createMockDirectory());
      expect(props.selectSource).not.toHaveBeenCalled();
    });

    it("should select item on enter onKeyDown event", async () => {
      const { component, props, instance } = render();
      await instance.focusItem(createMockItem());
      await component.update();
      await component
        .find(".sources-list")
        .simulate("keydown", { keyCode: 13 });
      expect(props.selectSource).toHaveBeenCalledWith(
        "server1.conn13.child1/39"
      );
    });

    it("does not select if no item is focused on", async () => {
      const { component, props } = render();
      await component
        .find(".sources-list")
        .simulate("keydown", { keyCode: 13 });
      expect(props.selectSource).not.toHaveBeenCalled();
    });
  });

  describe("handles items", () => {
    it("getChildren from directory", async () => {
      const { component } = render();
      const item = createMockDirectory("http://mdn.com/views", "views", [
        "a",
        "b"
      ]);
      const children = component
        .find("ManagedTree")
        .props()
        .getChildren(item);
      expect(children).toEqual(["a", "b"]);
    });

    it("getChildren from non directory", async () => {
      const { component } = render();
      const children = component
        .find("ManagedTree")
        .props()
        .getChildren(createMockItem());
      expect(children).toEqual([]);
    });

    it("onExpand", async () => {
      const { component, props } = render();
      const expandedState = ["x", "y"];
      await component
        .find("ManagedTree")
        .props()
        .onExpand({}, expandedState);
      expect(props.setExpandedState).toHaveBeenCalledWith(expandedState);
    });

    it("onCollapse", async () => {
      const { component, props } = render();
      const expandedState = ["y", "z"];
      await component
        .find("ManagedTree")
        .props()
        .onCollapse({}, expandedState);
      expect(props.setExpandedState).toHaveBeenCalledWith(expandedState);
    });

    it("getParent", async () => {
      const { component } = render();
      const item = component.state("sourceTree").contents[0].contents[0];
      const parent = component
        .find("ManagedTree")
        .props()
        .getParent(item);

      expect(parent.path).toEqual("mdn.com");
      expect(parent.contents).toHaveLength(3);
    });
  });

  describe("getPath", () => {
    it("should return path for item", async () => {
      const { instance } = render();
      const path = instance.getPath(createMockItem());
      expect(path).toEqual("http://mdn.com/one.js/one.js");
    });

    it("should return path for blackboxedboxed item", async () => {
      const item = createMockItem(
        "http://mdn.com/blackboxed.js",
        "blackboxed.js",
        { id: "server1.conn13.child1/59" }
      );

      const source = I.Map({
        "server1.conn13.child1/59": createMockSource(
          "server1.conn13.child1/59",
          "http://mdn.com/blackboxed.js",
          true
        )
      });

      const { instance } = render({
        sources: source
      });
      const path = instance.getPath(item);
      expect(path).toEqual(
        "http://mdn.com/blackboxed.js/blackboxed.js:blackboxed"
      );
    });
  });
});

function generateDefaults(overrides) {
  const defaultSources = I.Map({
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
  });
  return {
    autoExpandAll: true,
    selectLocation: jest.fn(),
    selectSource: jest.fn(),
    setExpandedState: jest.fn(),
    sources: defaultSources,
    debuggeeUrl: "http://mdn.com",
    clearProjectDirectoryRoot: jest.fn(),
    setProjectDirectoryRoot: jest.fn(),
    projectRoot: "",
    ...overrides
  };
}

function renderItem(
  instance,
  item = createMockItem(),
  depth = 1,
  focused = false,
  expanded = false,
  setExpanded = jest.fn()
) {
  return instance.renderItem(item, depth, focused, null, expanded, {
    setExpanded: setExpanded
  });
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<SourcesTree.WrappedComponent {...props} />);
  const defaultState = component.state();
  const instance = component.instance();

  instance.shouldComponentUpdate = () => true;

  return { component, props, defaultState, instance };
}

function createMockSource(id, url, isBlackBoxed = false) {
  return {
    id: id,
    url: url,
    isPrettyPrinted: false,
    isWasm: false,
    sourceMapURL: null,
    isBlackBoxed: isBlackBoxed,
    loadedState: "unloaded"
  };
}

function createMockDirectory(path = "folder/", name = "folder", contents = []) {
  return {
    name,
    path,
    contents
  };
}

function createMockItem(
  path = "http://mdn.com/one.js",
  name = "one.js",
  contents = { id: "server1.conn13.child1/39" }
) {
  return {
    name,
    path,
    contents
  };
}
