/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getMatchIndex } from "../editor/source-search";

describe("source-search", () => {
  describe("getMatchIndex", () => {
    it("iterates in the matches", () => {
      const count = 3;

      // reverse 2, 1, 0, 2

      let matchIndex = getMatchIndex(count, 2, true);
      expect(matchIndex).toBe(1);

      matchIndex = getMatchIndex(count, 1, true);
      expect(matchIndex).toBe(0);

      matchIndex = getMatchIndex(count, 0, true);
      expect(matchIndex).toBe(2);

      // forward 1, 2, 0, 1

      matchIndex = getMatchIndex(count, 1, false);
      expect(matchIndex).toBe(2);

      matchIndex = getMatchIndex(count, 2, false);
      expect(matchIndex).toBe(0);

      matchIndex = getMatchIndex(count, 0, false);
      expect(matchIndex).toBe(1);
    });
  });
});
