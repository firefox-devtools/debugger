import { createFactory } from "react";
import { shallow } from "enzyme";

import Close from "../../components/shared/Button/Close";

const CloseButton = createFactory(Close);

describe("CloseButton", () => {
  it("should call handleClick function", () => {
    const onClick = jest.genMockFunction();
    const wrapper = shallow(new CloseButton({ handleClick: onClick }));

    wrapper.simulate("click");
    expect(onClick).toBeCalled();
  });

  it("should render a button", () => {
    const onClick = jest.genMockFunction();
    const buttonClass = "class";
    const wrapper = shallow(
      new CloseButton({
        handleClick: onClick,
        buttonClass: buttonClass,
        tooltip: "Close button"
      })
    );

    expect(wrapper).toMatchSnapshot();
  });
});
