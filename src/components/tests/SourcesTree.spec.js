/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import SourcesTree from "../../components/PrimaryPanes/SourcesTree";
import * as I from "immutable";
import { showMenu } from "devtools-contextmenu";
import { copyToTheClipboard } from "../../utils/clipboard";
import {
  getShownSource,
  getSelectedSource,
  getDebuggeeUrl,
  getExpandedState,
  getProjectDirectoryRoot,
  getSources
} from "../../selectors";

jest.mock("devtools-contextmenu", () => ({ showMenu: jest.fn() }));
jest.mock("../../utils/clipboard", () => ({ copyToTheClipboard: jest.fn() }));
jest.mock("../../selectors");

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

const singleMockSource = I.Map({
  "server1.conn13.child1/41": createMockSource(
    "server1.conn13.child1/41",
    "http://mdn.com/three.js"
  )
});

const singleMockItem = createMockItem(
  "http://mdn.com/one.js",
  "one.js",
  I.Map({ id: "server1.conn13.child1/39" })
);

let defaultComponent;
let defaultProps;
let defaultState;
let componentWithRoot;
let propsWithRoot;

const emptyComponent = render({
  projectRoot: "custom",
  sources: I.Map()
}).component;

const mockRootDirectory = {
  contents: [],
  name: "root",
  path: "root/"
};

const mockDirectory = {
  contents: [],
  name: "folder",
  path: "folder/"
};

const mockEvent = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
};

describe("SourcesTree", () => {
  beforeEach(() => {
    let rendered = render();
    defaultComponent = rendered.component;
    defaultProps = rendered.props;
    defaultState = defaultComponent.state();

    rendered = render({
      projectRoot: "root/"
    });
    componentWithRoot = rendered.component;
    propsWithRoot = rendered.props;
  });

  afterEach(() => {
    copyToTheClipboard.mockClear();
    showMenu.mockClear();
    mockEvent.preventDefault.mockClear();
    mockEvent.stopPropagation.mockClear();
  });

  it("Should show the tree with nothing expanded", async () => {
    expect(defaultComponent).toMatchSnapshot();
  });

  describe("When loading initial source", () => {
    it("Shows the tree with one.js, two.js and three.js expanded", async () => {
      await defaultComponent.setProps({
        ...defaultProps,
        expanded: ["one.js", "two.js", "three.js"]
      });

      expect(defaultComponent).toMatchSnapshot();
    });
  });

  describe("After changing expanded nodes", () => {
    it("Shows the tree with four.js, five.js and six.js expanded", async () => {
      await defaultComponent.setProps({
        ...defaultProps,
        expanded: ["four.js", "five.js", "six.js"]
      });

      expect(defaultComponent).toMatchSnapshot();
    });
  });

  describe("on receiving new props", () => {
    describe("recreates tree", () => {
      it("does not recreate tree if no new source is added", async () => {
        defaultProps.sources = singleMockSource;

        await defaultComponent.setProps({
          ...defaultProps
        });

        expect(defaultComponent.state("uncollapsedTree")).toEqual(
          defaultState.uncollapsedTree
        );
      });

      it("updates tree with a new item", async () => {
        defaultProps.sources = defaultProps.sources.merge({
          "server1.conn13.child1/42": createMockSource(
            "server1.conn13.child1/42",
            "http://mdn.com/four.js"
          )
        });

        await defaultComponent.setProps({
          ...defaultProps
        });

        expect(
          defaultComponent.state("uncollapsedTree").contents[0].contents
        ).toHaveLength(4);
      });

      it("updates sources if sources are emptied", async () => {
        defaultProps.sources = I.Map({});

        expect(defaultState.uncollapsedTree.contents).toHaveLength(1);

        await defaultComponent.setProps({
          ...defaultProps
        });

        expect(defaultComponent.state("uncollapsedTree").contents).toHaveLength(
          0
        );
      });

      it("recreates tree if projectRoot is changed", async () => {
        defaultProps.sources = I.Map({
          "server1.conn13.child1/41": createMockSource(
            "server1.conn13.child1/41",
            "http://mozilla.com/three.js"
          )
        });
        defaultProps.projectRoot = "mozilla";

        expect(defaultState.uncollapsedTree.contents[0].contents).toHaveLength(
          3
        );

        await defaultComponent.setProps({
          ...defaultProps
        });

        expect(
          defaultComponent.state("uncollapsedTree").contents[0].contents
        ).toHaveLength(1);
      });

      it("recreates tree if debugeeUrl is changed", async () => {
        defaultProps.sources = singleMockSource;
        defaultProps.debuggeeUrl = "mozilla";

        expect(defaultState.uncollapsedTree.contents[0].contents).toHaveLength(
          3
        );

        await defaultComponent.setProps({
          ...defaultProps
        });

        expect(
          defaultComponent.state("uncollapsedTree").contents[0].contents
        ).toHaveLength(1);
      });
    });

    describe("updates list items", () => {
      it("updates list items if shownSource changes", async () => {
        defaultProps.shownSource = "http://mdn.com/three.js";
        await defaultComponent.setProps({
          ...defaultProps
        });
        expect(defaultComponent).toMatchSnapshot();
        expect(defaultProps.selectLocation).toHaveBeenCalledWith({
          sourceId: "server1.conn13.child1/41"
        });
      });
    });

    describe("updates highlighted items", () => {
      it("updates highlightItems if selectedSource changes", async () => {
        defaultProps.selectedSource = singleMockSource;
        await defaultComponent.setProps({
          ...defaultProps
        });
        expect(defaultComponent).toMatchSnapshot();
      });
    });
  });

  describe("focusItem", () => {
    it("update the focused item", async () => {
      expect(defaultComponent.state("focusedItem")).toEqual(null);
      await defaultComponent.instance().focusItem(singleMockItem);
      expect(defaultComponent.state("focusedItem")).toEqual(singleMockItem);
    });
  });

  describe("with custom root", () => {
    const { component, props } = render({
      projectRoot: "mdn"
    });

    it("renders custom root source list", async () => {
      expect(component).toMatchSnapshot();
    });

    it("renders empty custom root source list", async () => {
      expect(emptyComponent).toMatchSnapshot();
    });

    it("calls clearProjectDirectoryRoot on click", async () => {
      component.find(".sources-clear-root").simulate("click");
      expect(props.clearProjectDirectoryRoot).toHaveBeenCalled();
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
      await componentWithRoot
        .instance()
        .onContextMenu(mockEvent, mockDirectory);
      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(propsWithRoot.setProjectDirectoryRoot).toHaveBeenCalled();
      expect(propsWithRoot.clearProjectDirectoryRoot).not.toHaveBeenCalled();
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
      await componentWithRoot
        .instance()
        .onContextMenu(mockEvent, singleMockItem);
      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(propsWithRoot.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(propsWithRoot.clearProjectDirectoryRoot).not.toHaveBeenCalled();
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
      await componentWithRoot
        .instance()
        .onContextMenu(mockEvent, mockRootDirectory);
      expect(showMenu).toHaveBeenCalledWith(mockEvent, menuOptions);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      showMenu.mock.calls[0][1][0].click();
      expect(propsWithRoot.setProjectDirectoryRoot).not.toHaveBeenCalled();
      expect(propsWithRoot.clearProjectDirectoryRoot).toHaveBeenCalled();
      expect(copyToTheClipboard).not.toHaveBeenCalled();
    });
  });

  describe("renderItem", () => {
    it("should show icon for webpack item", async () => {
      const item = createMockItem("webpack://", "webpack://");
      const node = renderItem(defaultComponent, item);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for angular item", async () => {
      const item = createMockItem("ng://", "ng://");
      const node = renderItem(defaultComponent, item);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for moz-extension item", async () => {
      const item = createMockItem("moz-extension://", "moz-extension://");
      const node = renderItem(defaultComponent, item);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with arrow", async () => {
      const node = renderItem(defaultComponent, mockDirectory);
      expect(node).toMatchSnapshot();
    });

    it("should show icon for folder with expanded arrow", async () => {
      const node = renderItem(defaultComponent, mockDirectory, 1, false, true);
      expect(node).toMatchSnapshot();
    });

    it("should show focused item for folder with expanded arrow", async () => {
      const node = renderItem(defaultComponent, mockDirectory, 1, true, true);
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon", async () => {
      const node = renderItem(defaultComponent, singleMockItem);
      expect(node).toMatchSnapshot();
    });

    it("should show source item with source icon with focus", async () => {
      const node = renderItem(defaultComponent, singleMockItem, 1, true, false);
      expect(node).toMatchSnapshot();
    });

    it("should show domain item", async () => {
      const item = createMockItem("root", "root");
      const node = renderItem(defaultComponent, item, 0);
      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee", async () => {
      const item = createMockItem("root", "http://mdn.com");
      const node = renderItem(defaultComponent, item, 0);
      expect(node).toMatchSnapshot();
    });

    it("should show domain item as debuggee with focus and arrow", async () => {
      const item = createMockItem("root", "http://mdn.com", []);
      const node = renderItem(defaultComponent, item, 0, true);
      expect(node).toMatchSnapshot();
    });

    it("should not show domain item when the projectRoot exists", async () => {
      const node = renderItem(componentWithRoot, singleMockItem, 0);
      expect(node).toMatchSnapshot();
    });

    it("should show menu on contextmenu of an item", async () => {
      const event = { event: "contextmenu" };
      const node = shallow(
        renderItem(defaultComponent, singleMockItem, 1, true)
      );

      defaultComponent.instance().onContextMenu = jest.fn(() => {});

      node.simulate("contextmenu", event);
      expect(defaultComponent.instance().onContextMenu).toHaveBeenCalledWith(
        event,
        singleMockItem
      );
    });

    it("should focus on and select item on click", async () => {
      const event = { event: "click" };
      const setExpanded = jest.fn();
      const node = shallow(
        renderItem(
          defaultComponent,
          singleMockItem,
          1,
          true,
          false,
          setExpanded
        )
      );

      node.simulate("click", event);

      expect(defaultComponent.state("focusedItem")).toEqual(singleMockItem);
      expect(defaultProps.selectLocation).toHaveBeenCalledWith({
        sourceId: "server1.conn13.child1/39"
      });
      expect(setExpanded).not.toHaveBeenCalled();
    });

    it("should focus on and expand directory on click", async () => {
      const event = { event: "click" };
      const setExpanded = jest.fn();
      const node = shallow(
        renderItem(defaultComponent, mockDirectory, 1, true, false, setExpanded)
      );

      node.simulate("click", event);

      expect(defaultComponent.state("focusedItem")).toEqual(mockDirectory);
      expect(setExpanded).toHaveBeenCalled();
      expect(defaultProps.selectLocation).not.toHaveBeenCalledWith();
    });
  });

  describe("selectItem", () => {
    it("should select item with no children", async () => {
      defaultComponent.instance().selectItem(singleMockItem);
      expect(defaultProps.selectLocation).toHaveBeenCalledWith({
        sourceId: "server1.conn13.child1/39"
      });
    });

    it("should not select item with children", async () => {
      defaultComponent.instance().selectItem(mockDirectory);
      expect(defaultProps.selectLocation).not.toHaveBeenCalled();
    });

    it("should select item on enter", async () => {
      await defaultComponent.instance().focusItem(singleMockItem);
      await defaultComponent.update();
      await defaultComponent
        .find(".sources-list")
        .simulate("keydown", { keyCode: 13 });
      expect(defaultProps.selectLocation).toHaveBeenCalledWith({
        sourceId: "server1.conn13.child1/39"
      });
    });

    it("does not select if no item is focused on", async () => {
      await defaultComponent
        .find(".sources-list")
        .simulate("keydown", { keyCode: 13 });
      expect(defaultProps.selectLocation).not.toHaveBeenCalled();
    });
  });

  describe("handles items", () => {
    it("getChildren from directory", async () => {
      const item = createMockItem("http://mdn.com/views", "views", ["a", "b"]);
      const children = defaultComponent
        .find("ManagedTree")
        .props()
        .getChildren(item);
      expect(children).toEqual(["a", "b"]);
    });

    it("getChildren from non directory", async () => {
      const children = defaultComponent
        .find("ManagedTree")
        .props()
        .getChildren(singleMockItem);
      expect(children).toEqual([]);
    });

    it("onExpand", async () => {
      const expandedState = ["x", "y"];
      await defaultComponent
        .find("ManagedTree")
        .props()
        .onExpand({}, expandedState);
      expect(defaultProps.setExpandedState).toHaveBeenCalledWith(expandedState);
    });

    it("onCollapse", async () => {
      const expandedState = ["y", "z"];
      await defaultComponent
        .find("ManagedTree")
        .props()
        .onCollapse({}, expandedState);
      expect(defaultProps.setExpandedState).toHaveBeenCalledWith(expandedState);
    });

    it("getParent", async () => {
      const item = defaultComponent.state("sourceTree").contents[0].contents[0];
      const parent = defaultComponent
        .find("ManagedTree")
        .props()
        .getParent(item);

      expect(parent.path).toEqual("mdn.com");
      expect(parent.contents).toHaveLength(3);
    });
  });

  describe("getPath", () => {
    const { component } = render({
      sources: I.Map({
        "server1.conn13.child1/39": createMockSource(
          "server1.conn13.child1/39",
          "http://mdn.com/one.js"
        ),
        "server1.conn13.child1/59": createMockSource(
          "server1.conn13.child1/59",
          "http://mdn.com/blackboxed.js",
          true
        )
      })
    });

    it("should return path for item", async () => {
      const path = component.instance().getPath(singleMockItem);
      expect(path).toEqual("http://mdn.com/one.js/one.js/");
    });

    it("should return path for blackboxedboxed item", async () => {
      const item = createMockItem(
        "http://mdn.com/blackboxed.js",
        "blackboxed.js",
        I.Map({ id: "server1.conn13.child1/59" })
      );
      const path = component.instance().getPath(item);
      expect(path).toEqual("http://mdn.com/blackboxed.js/blackboxed.js/update");
    });
  });

  describe("test redux connect", () => {
    jest.mock("../../selectors");
    it("calls mapStateToProps", async () => {
      const state = { hello: "world" };
      const store = {
        getState: () => state,
        dispatch: () => {},
        subscribe: () => {}
      };
      shallow(<SourcesTree store={store} />);

      expect(getShownSource).toHaveBeenCalledWith(state);
      expect(getSelectedSource).toHaveBeenCalledWith(state);
      expect(getDebuggeeUrl).toHaveBeenCalledWith(state);
      expect(getExpandedState).toHaveBeenCalledWith(state);
      expect(getProjectDirectoryRoot).toHaveBeenCalledWith(state);
      expect(getSources).toHaveBeenCalledWith(state);
    });
  });
});

function generateDefaults(overrides) {
  return {
    autoExpandAll: true,
    selectLocation: jest.fn(),
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
  component,
  item = singleMockItem,
  depth = 1,
  focused = false,
  expanded = false,
  setExpanded = jest.fn()
) {
  return component.instance().renderItem(item, depth, focused, null, expanded, {
    setExpanded: setExpanded
  });
}

function render(overrides = {}) {
  const props = generateDefaults(overrides);
  const component = shallow(<SourcesTree.WrappedComponent {...props} />);

  component.instance().shouldComponentUpdate = () => true;

  return { component, props };
}

function createMockSource(id, url, isBlackBoxed = false) {
  return I.Map({
    id: id,
    url: url,
    isPrettyPrinted: false,
    isWasm: false,
    sourceMapURL: null,
    isBlackBoxed: isBlackBoxed,
    loadedState: "unloaded"
  });
}

function createMockItem(path = "item", name = "item", contents = I.Map()) {
  return {
    name,
    path,
    contents
  };
}
