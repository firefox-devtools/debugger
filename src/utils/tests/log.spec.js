/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
