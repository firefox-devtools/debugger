import React from "react";
import { mount, shallow } from "enzyme";
import { List } from "immutable";
import { ProjectSearch } from "../index.js";

const hooks = { on: [], off: [] };
const shortcuts = {
  dispatch(eventName) {
    hooks.on.forEach(hook => {
      if (hook.event === eventName) {
        hook.cb();
      }
    });
    hooks.off.forEach(hook => {
      if (hook.event === eventName) {
        hook.cb();
      }
    });
  },
  on: jest.fn((event, cb) => hooks.on.push({ event, cb })),
  off: jest.fn((event, cb) => hooks.off.push({ event, cb }))
};

const context = { shortcuts };

const testResults = List([
  {
    filepath: "testFilePath1",
    matches: [
      { match: "match1", value: "some thing match1", column: 30 },
      { match: "match2", value: "some thing match2", column: 60 },
      { match: "match3", value: "some thing match3", column: 90 }
    ]
  },
  {
    filepath: "testFilePath2",
    matches: [
      { match: "match4", value: "some thing match4", column: 80 },
      { match: "match5", value: "some thing match5", column: 40 }
    ]
  }
]);

const testMatch = { match: "match1", value: "some thing match1", column: 30 };

function render(overrides = {}, mounted = false) {
  const props = {
    status: "DONE",
    sources: {},
    results: List([]),
    query: "foo",
    activeSearch: "project",
    closeProjectSearch: jest.fn(),
    searchSources: jest.fn(),
    selectLocation: jest.fn(),
    ...overrides
  };

  return mounted
    ? mount(<ProjectSearch {...props} />, { context })
    : shallow(<ProjectSearch {...props} />, { context });
}

describe("ProjectSearch", () => {
  beforeEach(() => {
    context.shortcuts.on.mockClear();
    context.shortcuts.off.mockClear();
  });

  it("renders nothing when disabled", () => {
    const component = render({ activeSearch: null });
    expect(component).toMatchSnapshot();
  });

  it("where <Enter> has not been pressed", () => {
    const component = render({ query: "" });
    expect(component).toMatchSnapshot();
  });

  it("found no search results", () => {
    const component = render();
    expect(component).toMatchSnapshot();
  });

  it("found search results", () => {
    const component = render(
      {
        query: "match",
        results: testResults
      },
      true
    );
    expect(component).toMatchSnapshot();
  });

  it("turns off shortcuts on unmount", () => {
    const component = render({
      query: ""
    });
    expect(component).toMatchSnapshot();
    component.unmount();
    expect(context.shortcuts.off).toHaveBeenCalled();
  });

  it("calls inputOnChange", () => {
    const component = render(
      {
        results: testResults
      },
      true
    );
    component
      .find("SearchInput input")
      .simulate("change", { target: { value: "bar" } });
    expect(component.state().inputValue).toEqual("bar");
  });

  it("onKeyDown Escape/Other", () => {
    const searchSources = jest.fn();
    const component = render(
      {
        results: testResults,
        searchSources
      },
      true
    );
    component.find("SearchInput input").simulate("keydown", { key: "Escape" });
    expect(searchSources).not.toHaveBeenCalled();
    searchSources.mockClear();
    component
      .find("SearchInput input")
      .simulate("keydown", { key: "Other", stopPropagation: jest.fn() });
    expect(searchSources).not.toHaveBeenCalled();
  });

  it("onKeyDown Enter", () => {
    const searchSources = jest.fn();
    const component = render(
      {
        results: testResults,
        searchSources
      },
      true
    );
    component
      .find("SearchInput input")
      .simulate("keydown", { key: "Enter", stopPropagation: jest.fn() });
    expect(searchSources).toHaveBeenCalledWith("foo");
  });

  it("onEnterPress shortcut no match or setExpanded", () => {
    const selectLocation = jest.fn();
    const component = render(
      {
        results: testResults,
        selectLocation
      },
      true
    );
    component.instance().focusedItem = {};
    shortcuts.dispatch("Enter");
    expect(selectLocation).not.toHaveBeenCalled();
  });

  it("onEnterPress shortcut match", () => {
    const selectLocation = jest.fn();
    const component = render(
      {
        results: testResults,
        selectLocation
      },
      true
    );
    component.instance().focusedItem = { match: testMatch };
    shortcuts.dispatch("Enter");
    expect(selectLocation).toHaveBeenCalledWith(testMatch);
  });

  it("onEnterPress shortcut setExpanded", () => {
    const selectLocation = jest.fn();
    const component = render(
      {
        results: testResults,
        selectLocation
      },
      true
    );
    const setExpanded = jest.fn();
    const testFile = {
      filepath: "testFilePath1",
      matches: [testMatch]
    };
    component.instance().focusedItem = {
      setExpanded,
      file: testFile,
      expanded: true
    };
    shortcuts.dispatch("Enter");
    expect(setExpanded).toHaveBeenCalledWith(testFile, false);
  });
});
