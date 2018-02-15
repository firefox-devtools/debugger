import { actions, createStore } from "../../utils/test-head";
const threadClient = {
  evaluate: jest.fn()
};

describe("toolbox", () => {
  describe("evaluate in console", () => {
    it("variable", () => {
      const { dispatch } = createStore(threadClient);
      dispatch(actions.evaluateInConsole("foo"));

      expect(threadClient.evaluate).toBeCalledWith(
        'console.log("foo"); console.log(foo)',
        { frameId: undefined }
      );
    });
  });
});
