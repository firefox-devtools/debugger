import { createFactory } from "react";
import { shallow } from "enzyme";

import ResultListComponent from "../shared/ResultList";
const ResultList = createFactory(ResultListComponent);

const selectItem = jest.genMockFunction();
const selectedIndex = 1;
const payload = {
  items: [
    {
      id: 0,
      subtitle: "subtitle",
      title: "title",
      value: "value"
    },
    {
      id: 1,
      subtitle: "subtitle 1",
      title: "title 1",
      value: "value 1"
    }
  ],
  selected: selectedIndex,
  selectItem
};

describe("Result list", () => {
  it("should call onClick function", () => {
    const wrapper = shallow(ResultList(payload));

    wrapper.childAt(selectedIndex).simulate("click");
    expect(selectItem).toBeCalled();
  });

  it("should render the component", () => {
    const wrapper = shallow(ResultList(payload));
    expect(wrapper).toMatchSnapshot();
  });

  it("selected index should have 'selected class'", () => {
    const wrapper = shallow(ResultList(payload));
    const childHasClass = wrapper.childAt(selectedIndex).hasClass("selected");

    expect(childHasClass).toEqual(true);
  });
});
