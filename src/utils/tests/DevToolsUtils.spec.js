import { reportException, executeSoon } from "../DevToolsUtils.js";

describe("DevToolsUtils", () => {
  describe("reportException", () => {
    beforeEach(() => {
      global.console = { error: jest.fn() };
    });

    it("calls console.error", () => {
      reportException("caller", "you broke it");
      expect(console.error).toBeCalled();
    });

    it("returns a description of caller and exception text", () => {
      const who = {},
        exception = "this is an error",
        msgTxt = " threw an exception: ";

      reportException(who, exception);

      expect(console.error).toBeCalledWith(`${who}${msgTxt}`, exception);
    });
  });

  describe("executeSoon", () => {
    it("calls setTimeout with 0 ms", () => {
      global.setTimeout = jest.fn();
      const fnc = () => {};

      executeSoon(fnc);

      expect(setTimeout).toBeCalledWith(fnc, 0);
    });
  });
});
