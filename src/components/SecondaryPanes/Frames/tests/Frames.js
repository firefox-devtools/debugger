import React from "react";
import { shallow } from "enzyme";
import _Frames from "../index.js";
const Frames = React.createFactory(_Frames.WrappedComponent);

describe("Frames", () => {
  it("empty frames", () => {
    const frames = null;
    const selectedFrame = null;
    const component = shallow(
      new Frames({
        frames,
        selectedFrame,
        contextTypes: {},
        selectFrame: jest.fn()
      })
    );
    expect(component).toMatchSnapshot();
  });

  it("one frame", () => {
    const frames = [{ id: 1 }];
    const selectedFrame = frames[0];
    const selectFrame = jest.fn();

    const component = shallow(
      new Frames({
        frames,
        selectedFrame,
        contextTypes: {},
        selectFrame
      })
    );

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
    const component = shallow(
      new Frames({
        frames,
        selectedFrame,
        contextTypes: {},
        selectFrame: jest.fn()
      })
    );
    expect(component).toMatchSnapshot();
    const showMore = component.node.props.children[1];
    expect(showMore.props.className).toEqual("show-more");
  });

  it("library frames", () => {
    const frames = [
      { id: 1 },
      { id: 2, library: "back" },
      { id: 3, library: "back" },
      { id: 8 }
    ];
    const selectedFrame = frames[0];
    const component = shallow(
      new Frames({
        frames,
        selectedFrame,
        contextTypes: {},
        selectFrame: jest.fn()
      })
    );
    expect(component).toMatchSnapshot();
    // const showMore = component.node.props.children[1];
    // expect(showMore.props.className).toEqual("show-more");
  });
});
