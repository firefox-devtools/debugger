/* eslint max-nested-callbacks: ["error", 4] */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow, mount } from "enzyme";
import { QuickOpenModal } from "../QuickOpenModal";
import * as I from "immutable";

jest.mock("fuzzaldrin-plus");

import { filter } from "fuzzaldrin-plus";

function generateModal(propOverrides, renderType = "shallow") {
  const props = {
    enabled: false,
    query: "",
    searchType: "sources",
    sources: [],
    tabs: [],
    selectLocation: jest.fn(),
    setQuickOpenQuery: jest.fn(),
    highlightLineRange: jest.fn(),
    clearHighlightLineRange: jest.fn(),
    closeQuickOpen: jest.fn(),
    ...propOverrides
  };
  return {
    wrapper:
      renderType === "shallow"
        ? shallow(<QuickOpenModal {...props} />)
        : mount(<QuickOpenModal {...props} />),
    props
  };
}

describe("QuickOpenModal", () => {
  beforeEach(() => {
    filter.mockClear();
  });
  test("Doesn't render when disabled", () => {
    const { wrapper } = generateModal();
    expect(wrapper).toMatchSnapshot();
  });

  test("Renders when enabled", () => {
    const { wrapper } = generateModal({ enabled: true });
    expect(wrapper).toMatchSnapshot();
  });

  test("Basic render with mount", () => {
    const { wrapper } = generateModal({ enabled: true }, "mount");
    expect(wrapper).toMatchSnapshot();
  });

  test("Basic render with mount & searchType = functions", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        query: "@",
        searchType: "functions",
        symbols: {
          functions: [],
          variables: []
        }
      },
      "mount"
    );
    expect(wrapper).toMatchSnapshot();
  });

  test("Ensure anonymous functions do not render in QuickOpenModal", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        query: "@",
        searchType: "functions",
        symbols: {
          functions: [
            { title: "anonymous" },
            { title: "c" },
            { title: "anonymous" }
          ],
          variables: []
        }
      },
      "mount"
    );
    expect(wrapper.find("ResultList")).toHaveLength(1);
    expect(wrapper.find("li")).toHaveLength(1);
  });

  test("Basic render with mount & searchType = variables", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        query: "#",
        searchType: "variables",
        symbols: {
          functions: [],
          variables: []
        }
      },
      "mount"
    );
    expect(wrapper).toMatchSnapshot();
  });

  test("Basic render with mount & searchType = shortcuts", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        query: "?",
        searchType: "shortcuts",
        symbols: {
          functions: [],
          variables: []
        }
      },
      "mount"
    );
    expect(wrapper.find("ResultList")).toHaveLength(1);
    expect(wrapper.find("li")).toHaveLength(3);
  });

  test("updateResults on enable", () => {
    const { wrapper } = generateModal({}, "mount");
    expect(wrapper).toMatchSnapshot();
    wrapper.setProps({ enabled: true });
    expect(wrapper).toMatchSnapshot();
  });

  test("basic source search", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        symbols: {
          functions: [],
          variables: []
        }
      },
      "mount"
    );
    wrapper.find("input").simulate("change", { target: { value: "somefil" } });
    expect(filter).toHaveBeenCalledWith([], "somefil", {
      key: "value",
      maxResults: 1000
    });
  });

  test("basic gotoSource search", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        searchType: "gotoSource",
        symbols: {
          functions: [],
          variables: []
        }
      },
      "mount"
    );
    wrapper
      .find("input")
      .simulate("change", { target: { value: "somefil:33" } });
    expect(filter).toHaveBeenCalledWith([], "somefil", {
      key: "value",
      maxResults: 1000
    });
  });

  test("basic symbol seach", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        searchType: "functions",
        symbols: {
          functions: [],
          variables: []
        },
        // symbol searching relies on a source being selected.
        // So we dummy out the source and the API.
        selectedSource: { get: jest.fn(() => true) }
      },
      "mount"
    );
    wrapper
      .find("input")
      .simulate("change", { target: { value: "@someFunc" } });
    expect(filter).toHaveBeenCalledWith([], "someFunc", {
      key: "value",
      maxResults: 1000
    });
  });

  test("Simple goto search query = :abc & searchType = goto", () => {
    const { wrapper } = generateModal(
      {
        enabled: true,
        query: ":abc",
        searchType: "goto",
        symbols: {
          functions: [],
          variables: []
        }
      },
      "mount"
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.state().results).toEqual(null);
  });

  describe("onKeyDown", () => {
    it("does nothing if search type is not goto", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "test",
          searchType: "other"
        },
        "shallow"
      );
      wrapper.find("SearchInput").simulate("keydown", {});
      expect(props.selectLocation).not.toHaveBeenCalled();
      expect(props.setQuickOpenQuery).not.toHaveBeenCalled();
    });

    // it("does nothing if component is not enabled", () => {
    //   const { wrapper } = generateModal(
    //     {
    //       enabled: false,
    //       query: "test",
    //       searchType: "goto"
    //     },
    //     "shallow"
    //   );
    //   expect(wrapper.state().results).toEqual(null);
    //   expect(wrapper.instance().onKeyDown()).toBeUndefined();
    // });

    it("on Enter go to location", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: ":34:12",
          searchType: "goto"
        },
        "shallow"
      );
      const event = {
        key: "Enter"
      };
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(props.selectLocation).toHaveBeenCalledWith({
        column: 12,
        line: 34,
        sourceId: ""
      });
    });

    it("on Enter with results, handle @ shortcut", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "@test",
          searchType: "shortcuts"
        },
        "shallow"
      );
      wrapper.setState(() => ({
        results: [{ id: "@" }],
        selectedIndex: 0
      }));
      const event = {
        key: "Enter"
      };
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(props.setQuickOpenQuery).toHaveBeenCalledWith("@");
    });

    it("on Enter with results, handle : shortcut", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "@test",
          searchType: "shortcuts"
        },
        "shallow"
      );
      wrapper.setState(() => ({
        results: [{}, { id: ":" }],
        selectedIndex: 1
      }));
      const event = {
        key: "Enter"
      };
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(props.setQuickOpenQuery).toHaveBeenCalledWith(":");
    });

    it("on Enter with results, handle # shortcut", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "@test",
          searchType: "shortcuts"
        },
        "shallow"
      );
      wrapper.setState(() => ({
        results: [{}, { id: ":" }],
        selectedIndex: 1
      }));
      const event = {
        key: "Enter"
      };
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(props.selectLocation).not.toHaveBeenCalled();
      expect(props.setQuickOpenQuery).toHaveBeenCalledWith(":");
    });

    it("on Enter with results, handle result item", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "@test",
          searchType: "other"
        },
        "shallow"
      );
      const id = "id";
      wrapper.setState(() => ({
        results: [{}, { id }],
        selectedIndex: 1
      }));
      const event = {
        key: "Enter"
      };
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(props.selectLocation).toHaveBeenCalledWith({
        column: null,
        sourceId: id,
        line: 0
      });
      expect(props.setQuickOpenQuery).not.toHaveBeenCalled();
    });

    it("on Tab, close modal", () => {
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: ":34:12",
          searchType: "goto"
        },
        "shallow"
      );
      const event = {
        key: "Tab"
      };
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(props.closeQuickOpen).toHaveBeenCalled();
      expect(props.selectLocation).not.toHaveBeenCalled();
    });

    it("on ArrowUp, traverse results up with functions", () => {
      const sourceId = "sourceId";
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "test",
          searchType: "functions",
          selectedSource: I.Map({id:sourceId}),
          symbols: {
            functions: [{title: "functionA"}, {title: "anonymous"}],
            variables: {}
          }
        },
        "shallow"
      );
      const event = {
        preventDefault: jest.fn(),
        key: "ArrowUp"
      };
      const location = {
        start: {
          line: 1
        },
        end: {
          line: 3
        }
      };
      wrapper.setState(() => ({
        results: [{id: "0", location}, { id: "1"}, {id: "2"}],
        selectedIndex: 1
      }));
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(wrapper.state().selectedIndex).toEqual(0);
      expect(props.highlightLineRange).toHaveBeenCalledWith({"end": 3, "sourceId": sourceId, "start": 1});
    });

    it("on ArrowDown, traverse down with variables", () => {
      const sourceId = "sourceId";
      const { wrapper, props } = generateModal(
        {
          enabled: true,
          query: "test",
          searchType: "variables",
          selectedSource: I.Map({id:sourceId}),
          symbols: {
            functions: [{title: "functionA"}, {title: "anonymous"}],
            variables: {}
          }
        },
        "shallow"
      );
      const event = {
        preventDefault: jest.fn(),
        key: "ArrowDown"
      };
      const location = {
        start: {
          line: 7
        }
      };
      wrapper.setState(() => ({
        results: [{id: "0", location}, { id: "1"}, {id: "2"}],
        selectedIndex: 1
      }));
      wrapper.find("SearchInput").simulate("keydown", event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(wrapper.state().selectedIndex).toEqual(2);
      expect(props.selectLocation).toHaveBeenCalledWith({});
    });
  });

  describe("showErrorEmoji", () => {
    it("true when no count + query", () => {
      const { wrapper } = generateModal(
        {
          enabled: true,
          query: "test",
          searchType: ""
        },
        "mount"
      );
      expect(wrapper).toMatchSnapshot();
    });

    it("false when count + query", () => {
      const { wrapper } = generateModal(
        {
          enabled: true,
          query: "dasdasdas"
        },
        "mount"
      );
      wrapper.setState(() => ({
        results: [1, 2]
      }));
      expect(wrapper).toMatchSnapshot();
    });

    it("false when no query", () => {
      const { wrapper } = generateModal(
        {
          enabled: true,
          query: "",
          searchType: ""
        },
        "mount"
      );
      expect(wrapper).toMatchSnapshot();
    });

    it("false when goto numeric ':2222'", () => {
      const { wrapper } = generateModal(
        {
          enabled: true,
          query: ":2222",
          searchType: "goto"
        },
        "mount"
      );
      expect(wrapper).toMatchSnapshot();
    });

    it("true when goto not numeric ':22k22'", () => {
      const { wrapper } = generateModal(
        {
          enabled: true,
          query: ":22k22",
          searchType: "goto"
        },
        "mount"
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
