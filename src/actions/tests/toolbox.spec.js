import { actions, createStore } from "../../utils/test-head";

describe("toolbox", () => {
  describe("evaluate in console", () => {
    it("variable", () => {
      const test = "meBeTest";
      const threadClient = {
        evaluate: jest.fn()
      };
      const { dispatch } = createStore(threadClient);
      dispatch(actions.evaluateInConsole(test));
      expect(threadClient.evaluate).toHaveBeenCalledWith(
        "meBeTest.toString()",
        { frameId: undefined }
      );
    });

    it("function", () => {
      function testFunction() {}
      const threadClient = {
        evaluate: jest.fn()
      };
      const { dispatch } = createStore(threadClient);
      dispatch(actions.evaluateInConsole(testFunction));
      expect(threadClient.evaluate).toHaveBeenCalledWith(
        "function testFunction() {}.toString()",
        { frameId: undefined }
      );
    });
  });
});
