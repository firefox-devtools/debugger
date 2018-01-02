import React from "react";
import { shallow } from "enzyme";
import { Map } from "immutable";
import Frames from "../index.js";
// eslint-disable-next-line
import { formatCallStackFrames } from "../../../../selectors/getCallStackFrames";

function render(overrides = {}) {
  const defaultProps = {
    frames: null,
    selectedFrame: null,
    frameworkGroupingOn: false,
    toggleFrameworkGrouping: jest.fn(),
    contextTypes: {},
    selectFrame: jest.fn(),
    toggleBlackBox: jest.fn()
  };

  const props = { ...defaultProps, ...overrides };
  const component = shallow(<Frames.WrappedComponent {...props} />);

  return component;
}

describe("Frames", () => {
  describe("Supports different number of frames", () => {
    it("empty frames", () => {
      const component = render();
      expect(component).toMatchSnapshot();
      expect(component.find(".show-more").exists()).toBeFalsy();
    });

    it("one frame", () => {
      const frames = [{ id: 1 }];
      const selectedFrame = frames[0];
      const component = render({ frames, selectedFrame });

      expect(component.find(".show-more").exists()).toBeFalsy();
      expect(component).toMatchSnapshot();
    });

    it("toggling the show more button", () => {
      const frames = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
        { id: 7 },
        { id: 8 },
        { id: 9 },
        { id: 10 }
      ];

      const selectedFrame = frames[0];
      const component = render({ selectedFrame, frames });

      const getToggleBtn = () => component.find(".show-more");
      const getFrames = () => component.find("FrameComponent");

      expect(getToggleBtn().text()).toEqual("Expand rows");
      expect(getFrames()).toHaveLength(7);

      getToggleBtn().simulate("click");
      expect(getToggleBtn().text()).toEqual("Collapse rows");
      expect(getFrames()).toHaveLength(10);
      expect(component).toMatchSnapshot();
    });
  });

  describe("Blackboxed Frames", () => {
    it("filters blackboxed frames", () => {
      const frames = [
        { id: 1, location: { sourceId: "1" } },
        { id: 2, location: { sourceId: "2" } },
        { id: 3, location: { sourceId: "1" } },
        { id: 8, location: { sourceId: "2" } }
      ];

      const sources = Map({
        1: Map({ id: "1" }),
        2: Map({ id: "2", isBlackBoxed: true })
      });

      const processedFrames = formatCallStackFrames(
        frames,
        sources,
        sources.get("1")
      );
      const selectedFrame = frames[0];

      const component = render({
        frames: processedFrames,
        frameworkGroupingOn: false,
        selectedFrame
      });

      expect(component.find("FrameComponent")).toHaveLength(2);
      expect(component).toMatchSnapshot();
    });
  });

  describe("Library Frames", () => {
    it("toggling framework frames", () => {
      const frames = [
        { id: 1 },
        { id: 2, library: "back" },
        { id: 3, library: "back" },
        { id: 8 }
      ];

      const selectedFrame = frames[0];
      const frameworkGroupingOn = false;
      const component = render({ frames, frameworkGroupingOn, selectedFrame });

      expect(component.find("FrameComponent")).toHaveLength(4);
      expect(component).toMatchSnapshot();

      component.setProps({ frameworkGroupingOn: true });

      expect(component.find("FrameComponent")).toHaveLength(2);
      expect(component).toMatchSnapshot();
    });
  });
});
