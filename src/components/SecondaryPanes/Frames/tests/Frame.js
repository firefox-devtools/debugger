import React from "react";
import { shallow } from "enzyme";
import FrameComponent from "../Frame.js";
const Frame = React.createFactory(FrameComponent);

describe("Frame", () => {
  it("user frame", () => {
    const frame = {
      id: 1,
      source: {
        url: "foo-view.js"
      },
      displayName: "renderFoo",
      library: false,
      location: {
        line: 10
      }
    };
    const selectedFrame = frame;
    const selectFrame = jest.fn();

    const component = shallow(
      new Frame({
        frame,
        selectedFrame,
        contextTypes: {},
        selectFrame
      })
    );

    expect(component).toMatchSnapshot();
  });

  it("user frame (not selected)", () => {
    const frame = {
      id: 1,
      source: {
        url: "foo-view.js"
      },
      displayName: "renderFoo",
      library: false,
      location: {
        line: 10
      }
    };
    const selectedFrame = Object.assign({}, frame, { id: 2 });
    const selectFrame = jest.fn();

    const component = shallow(
      new Frame({
        frame,
        selectedFrame,
        contextTypes: {},
        selectFrame
      })
    );

    expect(component).toMatchSnapshot();
  });

  it("library frame", () => {
    const frame = {
      id: 3,
      source: {
        url: "backbone.js"
      },
      displayName: "updateEvents",
      library: "backbone",
      location: {
        line: 12
      }
    };
    const selectedFrame = frame;
    const selectFrame = jest.fn();

    const component = shallow(
      new Frame({
        frame,
        selectedFrame,
        contextTypes: {},
        selectFrame
      })
    );

    expect(component).toMatchSnapshot();
  });
});
