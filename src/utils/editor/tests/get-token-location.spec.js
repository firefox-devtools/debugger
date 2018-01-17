import { getTokenLocation } from "../get-token-location";

describe("getTokenLocation", () => {
  const codemirror = {
    coordsChar: jest.fn(() => ({
      line: 1,
      ch: "C"
    }))
  };
  const token = {
    getBoundingClientRect() {
      return {
        left: 10,
        top: 20,
        width: 10,
        height: 10
      };
    }
  };
  it("calls into codeMirror", () => {
    getTokenLocation(codemirror, token);
    expect(codemirror.coordsChar).toHaveBeenCalledWith({
      left: 15,
      top: 25
    });
  });
});
