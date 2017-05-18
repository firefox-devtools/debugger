import React from "react";
import { shallow } from "enzyme";
import _Frames from "../index.js";
const Frames = React.createFactory(_Frames.WrappedComponent);

function render(overrides = {}) {
  const defaultProps = {
    frames: null,
    selectedFrame: null,
    frameworkGroupingOn: false,
    toggleFrameworkGrouping: jest.fn(),
    contextTypes: {},
    selectFrame: jest.fn()
  };

  const props = Object.assign({}, defaultProps, overrides);
  const component = shallow(new Frames(props));

  return component;
}

describe("Frames", () => {
  it("empty frames", () => {
    const component = render();
    expect(component).toMatchSnapshot();
  });

  it("one frame", () => {
    const frames = [{ id: 1 }];
    const selectedFrame = frames[0];
    const component = render({ frames, selectedFrame });

    expect(component).toMatchSnapshot();
  });

  it("lots of frames", () => {
    const frames = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 }
    ];
    const selectedFrame = frames[0];
    const component = render({ frames, selectedFrame });

    expect(component).toMatchSnapshot();
    const showMore = component.node.props.children[1];
    expect(showMore.props.className).toEqual("show-more");
  });

  describe("Library Frames", () => {
    it("expand framework frames into a multiple frames", () => {
      const frames = [
        { id: 1 },
        { id: 2, library: "back" },
        { id: 3, library: "back" },
        { id: 8 }
      ];
      const selectedFrame = frames[0];
      const frameworkGroupingOn = false;
      const component = render({ frames, frameworkGroupingOn, selectedFrame });
      expect(component).toMatchSnapshot();
      // const showMore = component.node.props.children[1];
      // expect(showMore.props.className).toEqual("show-more");
    });

    it("collapse framework frames into a single frame", () => {
      const frames = [
        { id: 1 },
        { id: 2, library: "back" },
        { id: 3, library: "back" },
        { id: 8 }
      ];
      const selectedFrame = frames[0];
      const component = render({
        frames,
        selectedFrame,
        frameworkGroupingOn: true
      });
      expect(component).toMatchSnapshot();
    });
  });
});
