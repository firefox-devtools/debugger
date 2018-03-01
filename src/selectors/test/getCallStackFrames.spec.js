/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getCallStackFrames } from "../getCallStackFrames";
import { fromJS } from "immutable";
import { pullAt } from "lodash";

describe("getCallStackFrames selector", () => {
  describe("library annotation", () => {
    it("annotates React frames", () => {
      const state = {
        frames: [
          { location: { sourceId: "source1" } },
          { location: { sourceId: "source2" } },
          { location: { sourceId: "source2" } }
        ],
        sources: fromJS({
          source1: { id: "source1", url: "webpack:///src/App.js" },
          source2: {
            id: "source2",
            url: "webpack:///~/react-dom/lib/ReactCompositeComponent.js"
          }
        }),
        selectedSource: fromJS({
          id: "sourceId-originalSource"
        })
      };

      const frames = getCallStackFrames.resultFunc(
        state.frames,
        state.sources,
        state.selectedSource,
        true
      );

      expect(frames[0]).not.toHaveProperty("library");
      expect(frames[1]).toHaveProperty("library", "React");
      expect(frames[2]).toHaveProperty("library", "React");
    });

    it("annotates Babel async transform frames before an await call", () => {
      const state = {
        frames: [
          {
            displayName: "_callee2$",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "tryCatch",
            location: { sourceId: "regenerator" }
          },
          {
            displayName: "invoke",
            location: { sourceId: "regenerator" }
          },
          {
            displayName: "defineIteratorMethods/</prototype[method]",
            location: { sourceId: "regenerator" }
          },
          {
            displayName: "step",
            location: { sourceId: "promise" }
          },
          {
            displayName: "_asyncToGenerator/</<",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "Promise",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "_asyncToGenerator/<",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "asyncAppFunction",
            location: { sourceId: "app" }
          }
        ],
        sources: fromJS({
          app: { id: "app", url: "webpack///app.js" },
          bundle: { id: "bundle", url: "https://foo.com/bundle.js" },
          regenerator: {
            id: "regenerator",
            url: "webpack:///foo/node_modules/regenerator-runtime/runtime.js"
          },
          promise: {
            id: "promise",
            url: "webpack///foo/node_modules/core-js/modules/es6.promise.js"
          }
        }),
        selectedSource: fromJS({
          id: "sourceId-originalSource"
        })
      };

      const frames = getCallStackFrames.resultFunc(
        state.frames,
        state.sources,
        state.selectedSource,
        true
      );

      expect(frames[0]).not.toHaveProperty("library");
      expect(frames[1]).toHaveProperty("library", "Babel");
      expect(frames[2]).toHaveProperty("library", "Babel");
      expect(frames[3]).toHaveProperty("library", "Babel");
      expect(frames[4]).toHaveProperty("library", "Babel");
      expect(frames[5]).toHaveProperty("library", "Babel");
      expect(frames[6]).toHaveProperty("library", "Babel");
    });

    it("annotates Babel async transform frames after an await call", () => {
      const state = {
        frames: [
          {
            displayName: "_callee2$",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "tryCatch",
            location: { sourceId: "regenerator" }
          },
          {
            displayName: "invoke",
            location: { sourceId: "regenerator" }
          },
          {
            displayName: "defineIteratorMethods/</prototype[method]",
            location: { sourceId: "regenerator" }
          },
          {
            displayName: "step",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "step/<",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "run",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "notify/<",
            location: { sourceId: "bundle" }
          },
          {
            displayName: "flush",
            location: { sourceId: "microtask" }
          }
        ],
        sources: fromJS({
          bundle: { id: "bundle", url: "https://foo.com/bundle.js" },
          regenerator: {
            id: "regenerator",
            url: "webpack:///foo/node_modules/regenerator-runtime/runtime.js"
          },
          microtask: {
            id: "microtask",
            url: "webpack:///foo/node_modules/core-js/modules/_microtask.js"
          }
        }),
        selectedSource: fromJS({
          id: "sourceId-originalSource"
        })
      };

      const frames = getCallStackFrames.resultFunc(
        state.frames,
        state.sources,
        state.selectedSource,
        true
      );

      expect(frames[0]).not.toHaveProperty("library");
      expect(frames[1]).toHaveProperty("library", "Babel");
      expect(frames[2]).toHaveProperty("library", "Babel");
      expect(frames[3]).toHaveProperty("library", "Babel");
      expect(frames[4]).toHaveProperty("library", "Babel");
      expect(frames[5]).toHaveProperty("library", "Babel");
      expect(frames[6]).toHaveProperty("library", "Babel");
      expect(frames[7]).toHaveProperty("library", "Babel");
    });

    // Multiple Babel async frame groups occur when breaking in an async function
    // that is being awaited on by a caller that is itself being awaited on.
    //
    // There are two possible frame groups that can occur depending on whether
    // one sets a breakpoint before or after an await
    it("annotates frames related to Babel async transforms", () => {
      const preAwaitSubstack = [
        {
          displayName: "_callee$",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "tryCatch",
          location: { sourceId: "regenerator" }
        },
        {
          displayName: "invoke",
          location: { sourceId: "regenerator" }
        },
        {
          displayName: "defineIteratorMethods/</prototype[method]",
          location: { sourceId: "regenerator" }
        },
        {
          displayName: "step",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "_asyncToGenerator/</<",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "Promise",
          location: { sourceId: "promise" }
        },
        {
          displayName: "_asyncToGenerator/<",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "asyncAppFunction",
          location: { sourceId: "app" }
        }
      ];

      const postAwaitSubstack = [
        {
          displayName: "_callee$",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "tryCatch",
          location: { sourceId: "regenerator" }
        },
        {
          displayName: "invoke",
          location: { sourceId: "regenerator" }
        },
        {
          displayName: "defineIteratorMethods/</prototype[method]",
          location: { sourceId: "regenerator" }
        },
        {
          displayName: "step",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "step/<",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "run",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "notify/<",
          location: { sourceId: "bundle" }
        },
        {
          displayName: "flush",
          location: { sourceId: "microtask" }
        }
      ];

      const state = {
        frames: [...preAwaitSubstack, ...postAwaitSubstack],
        sources: fromJS({
          app: { id: "app", url: "webpack///app.js" },
          bundle: { id: "bundle", url: "https://foo.com/bundle.js" },
          regenerator: {
            id: "regenerator",
            url: "webpack:///foo/node_modules/regenerator-runtime/runtime.js"
          },
          microtask: {
            id: "microtask",
            url: "webpack:///foo/node_modules/core-js/modules/_microtask.js"
          },
          promise: {
            id: "promise",
            url: "webpack///foo/node_modules/core-js/modules/es6.promise.js"
          }
        }),
        selectedSource: fromJS({
          id: "sourceId-originalSource"
        })
      };

      const frames = getCallStackFrames.resultFunc(
        state.frames,
        state.sources,
        state.selectedSource
      );

      const babelFrames = pullAt(frames, [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17
      ]);
      const otherFrames = frames;

      expect(babelFrames).toHaveProperty("library", "Babel");
      expect(otherFrames).not.toHaveProperty("library");
    });
  });
});
