import previewFunction from "../../components/shared/previewFunction";

describe("PreviewFunction", () => {
  it("should return a span", () => {
    const item = {};
    const returnedSpan = previewFunction(item);
    expect(returnedSpan.type).toEqual("span");
  });

  it('should return a span with a class of "function-signature"', () => {
    const item = {};
    const returnedSpan = previewFunction(item);
    const className = returnedSpan.props.className;
    expect(className).toEqual("function-signature");
  });

  it("should return a span with 3 children", () => {
    const item = {};
    const returnedSpan = previewFunction(item);
    const children = returnedSpan.props.children;
    expect(children.length).toEqual(3);
  });

  describe("function name", () => {
    it("should be a span", () => {
      const item = {};
      const returnedSpan = previewFunction(item);
      const nameSpanChild = returnedSpan.props.children[0];
      expect(nameSpanChild.type).toEqual("span");
    });

    it('should have a "function-name" class', () => {
      const item = {};
      const returnedSpan = previewFunction(item);
      const nameSpanChild = returnedSpan.props.children[0];
      expect(nameSpanChild.props.className).toEqual("function-name");
    });

    it("should be be set to userDisplayName if defined", () => {
      const item = {
        userDisplayName: "chuck",
        displayName: "norris"
      };
      const returnedSpan = previewFunction(item);
      const nameSpanChild = returnedSpan.props.children[0];
      expect(nameSpanChild.props.children).toEqual("chuck");
    });

    it('should use displayName if defined & no "userDisplayName" exist', () => {
      const item = {
        displayName: "norris",
        name: "last"
      };
      const returnedSpan = previewFunction(item);
      const nameSpanChild = returnedSpan.props.children[0];
      expect(nameSpanChild.props.children).toEqual("norris");
    });

    it('should use to name if no "userDisplayName"/"displayName" exist', () => {
      const item = {
        name: "last"
      };
      const returnedSpan = previewFunction(item);
      const nameSpanChild = returnedSpan.props.children[0];
      expect(nameSpanChild.props.children).toEqual("last");
    });
  });

  describe("render parentheses", () => {
    let leftParen;
    let rightParen;

    beforeAll(() => {
      const item = {};
      const returnedSpan = previewFunction(item);
      const children = returnedSpan.props.children;
      leftParen = children[1];
      rightParen = children[children.length - 1];
    });

    it("should be spans", () => {
      expect(leftParen.type).toEqual("span");
      expect(rightParen.type).toEqual("span");
    });

    it("should create a left paren", () => {
      expect(leftParen.props.children).toEqual("(");
    });

    it("should create a right paren", () => {
      expect(rightParen.props.children).toEqual(")");
    });
  });

  describe("render parameters", () => {
    let children;

    beforeAll(() => {
      const item = {
        parameterNames: ["one", "two", "three"]
      };
      const returnedSpan = previewFunction(item);
      children = returnedSpan.props.children;
    });

    it("should render spans according to the dynamic params given", () => {
      expect(children.length).toEqual(9);
    });

    it("should render the parameters names", () => {
      expect(children[2].props.children).toEqual("one");
    });

    it("should render the parameters commas", () => {
      expect(children[3].props.children).toEqual(", ");
    });
  });
});
