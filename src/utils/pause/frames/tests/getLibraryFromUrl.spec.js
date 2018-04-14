/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getLibraryFromUrl } from "../getLibraryFromUrl";

describe("getLibraryFromUrl", () => {
  describe("When Preact is on the frame", () => {
    it("should return Preact and not React", () => {
      const frame = {
        displayName: "name",
        location: {
          line: 12
        },
        source: {
          url: "https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.5/preact.js"
        }
      };

      expect(getLibraryFromUrl(frame)).toEqual("Preact");
    });
  });
});
