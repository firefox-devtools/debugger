import React from "react";
import { shallow } from "enzyme";
import { List } from "immutable";
import { ProjectSearch } from "../index.js";

function render(overrides = {}) {
  const defaultProps = {
    sources: {},
    results: new List(),
    query: "foo",
    activeSearch: "project",
    closeProjectSearch: jest.fn(),
    searchSources: jest.fn(),
    selectLocation: jest.fn()
  };
  const props = { ...defaultProps, ...overrides };

  const component = shallow(<ProjectSearch {...props} />, {
    disableLifecycleMethods: true
  });
  return component;
}

describe("ProjectSearch", () => {
  it("where <Enter> has not been pressed", () => {
    const component = render({
      query: ""
    });
    expect(component).toMatchSnapshot();
  });

  it("found no search results", () => {
    const component = render();
    expect(component).toMatchSnapshot();
  });

  it("found search results", () => {
    const component = render({
      query: "match",
      results: new List([
        {
          filepath: "testFilePath1",
          matches: ["match1", "match2", "match3"]
        },
        {
          filepath: "testFilePath2",
          matches: ["match4", "match5"]
        }
      ])
    });
    expect(component).toMatchSnapshot();
  });
});
