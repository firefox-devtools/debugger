import React from "react";
import { shallow, mount } from "enzyme";
import { QuickOpenModal } from "../QuickOpenModal";

function generateModal(propOverrides, renderType = "shallow") {
  const props = {
    enabled: false,
    query: "",
    searchType: "sources",
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

  test("closeModal", () => {
    const { wrapper, props } = generateModal({ enabled: true }, "mount");
    expect(wrapper).toMatchSnapshot();
    wrapper.find("CloseButton").simulate("click");
    expect(props.closeQuickOpen).toHaveBeenCalled();
  });

  test("updateResults on enable", () => {
    const { wrapper } = generateModal({}, "mount");
    expect(wrapper).toMatchSnapshot();
    wrapper.setProps({ enabled: true });
    expect(wrapper).toMatchSnapshot();
  });
});
