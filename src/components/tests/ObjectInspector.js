import { shallow } from "enzyme";
import { renderItem } from "../shared/ObjectInspector";

const arrayGrip = {
  type: "object",
  class: "Array",
  preview: {
    kind: "ArrayLike",
    length: 1,
    items: [{}]
  }
};

describe("ObjectInspector", () => {
  it("should render simple values (foo: 2)", () => {
    const item = {
      name: "foo",
      path: "foo",
      contents: { value: 2 }
    };

    const wrapper = shallow(
      renderItem(item, 0, false, {}, false, {
        setExpanded: () => {}
      })
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("expands on click", () => {
    const item = {
      name: "foo",
      path: "foo",
      contents: { value: 2 }
    };

    const setExpanded = jest.fn();
    const wrapper = shallow(
      renderItem(item, 0, false, {}, false, {
        setExpanded
      })
    );
    wrapper.simulate("click", { stopPropagation: () => {} });
    expect(setExpanded).toBeCalled();
  });

  it("should render arrays ([foo: 2])", () => {
    const value = arrayGrip;
    const item = {
      name: "foo",
      path: "foo",
      contents: { value }
    };

    const wrapper = shallow(
      renderItem(item, 0, false, {}, false, {
        setExpanded: () => {}
      })
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render expanded arrays ([foo: 2])", () => {
    const value = arrayGrip;
    const item = {
      name: "foo",
      path: "foo",
      contents: { value }
    };

    const wrapper = shallow(
      renderItem(item, 0, false, {}, true, {
        setExpanded: () => {}
      })
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render functions", () => {
    const value = {
      type: "object",
      class: "Function",
      preview: {}
    };
    const item = {
      name: "foo",
      path: "foo",
      contents: { value }
    };

    const wrapper = shallow(
      renderItem(item, 0, false, {}, true, {
        setExpanded: () => {}
      })
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render optimized items", () => {
    const item = {
      name: "foo",
      path: "foo",
      contents: { value: { optimizedOut: true } }
    };

    const wrapper = shallow(
      renderItem(item, 0, false, {}, true, {
        setExpanded: () => {}
      })
    );

    const objValue = wrapper.find(".object-value").text();
    expect(wrapper).toMatchSnapshot();
    expect(objValue).toEqual("(optimized away)");
  });

  it("should render missing arguments", () => {
    const item = {
      name: "foo",
      path: "foo",
      contents: { value: { missingArguments: true } }
    };

    const wrapper = shallow(
      renderItem(item, 0, false, {}, true, {
        setExpanded: () => {}
      })
    );

    const objValue = wrapper.find(".object-value").text();
    expect(wrapper).toMatchSnapshot();
    expect(objValue).toEqual("(unavailable)");
  });
});
