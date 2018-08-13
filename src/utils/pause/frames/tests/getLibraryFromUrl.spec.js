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

  describe("When Vue is on the frame", () => {
    it("should return VueJS for different builds", () => {
      const buildTypeList = [
        "vue.js",
        "vue.common.js",
        "vue.esm.js",
        "vue.runtime.js",
        "vue.runtime.common.js",
        "vue.runtime.esm.js",
        "vue.min.js",
        "vue.runtime.min.js"
      ];

      buildTypeList.forEach(buildType => {
        const frame = {
          displayName: "name",
          location: {
            line: 42
          },
          source: {
            url: `https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/${buildType}`
          }
        };

        expect(getLibraryFromUrl(frame)).toEqual("VueJS");
      });
    });
  });
});
