import { log } from "../log.js";

let logArgFirst, logArgSecond, logArgArray, logPrefix;

describe("log()", () => {
  beforeEach(() => {
    logArgFirst = "my info";
    logArgSecond = "my other info";
    logArgArray = [logArgFirst, logArgSecond];
    logPrefix = "[log]";

    global.console = { log: jest.fn() };
  });

  describe("when isDevelopment", () => {
    it("prints all arguments, prefixed with a log label", () => {
      log(logArgArray);

      expect(global.console.log).toHaveBeenCalledWith(logPrefix, logArgArray);
    });
  });

  describe("when not isDevelopment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it("returns undefined", () => {
      expect(log(logArgArray)).toEqual(undefined);
    });

    it("produces no logs", () => {
      log(logArgArray);

      expect(global.console.log).not.toHaveBeenCalled();
    });
  });
});
