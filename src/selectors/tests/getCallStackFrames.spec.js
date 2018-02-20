import { getCallStackFrames } from "../getCallStackFrames";
import { fromJS } from "immutable";

describe("getCallStackFrames selector", () => {
  describe("framework grouping", () => {
    it("does not group library frames when grouping is disabled", () => {
      const state = {
        frames: [
          { id: "frame1", location: { sourceId: "source2" } },
          { id: "frame2", location: { sourceId: "source1" } },
          { id: "frame3", location: { sourceId: "source1" } }
        ],
        sources: fromJS({
          source1: {
            id: "source1",
            url: "webpack:///~/react-dom/lib/ReactCompositeComponent.js"
          },
          source2: { id: "source2", url: "webpack:///src/App.js" }
        }),
        selectedSource: fromJS({
          id: "sourceId-originalSource"
        })
      };

      const frames = getCallStackFrames.resultFunc(
        state.frames,
        state.sources,
        state.selectedSource,
        false
      );

      expect(frames).toEqual([
        expect.objectContaining({ id: "frame1" }),
        expect.objectContaining({ id: "frame2" }),
        expect.objectContaining({ id: "frame3" })
      ]);
    });

    it("groups library frames", () => {
      const state = {
        frames: [
          { location: { sourceId: "source1" } },
          { location: { sourceId: "source2" } },
          { location: { sourceId: "source2" } }
        ],
        sources: fromJS({
          source1: { id: "source2", url: "webpack:///src/App.js" },
          source2: {
            id: "source1",
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

      expect(frames).toEqual([
        expect.objectContaining(state.frames[0]),
        [
          expect.objectContaining({ ...state.frames[1], library: "React" }),
          expect.objectContaining({ ...state.frames[2], library: "React" })
        ]
      ]);
    });

    it("groups the webpackBootstrap frame with other Webpack frames", () => {
      const state = {
        frames: [
          { location: { sourceId: "source1" } },
          { location: { sourceId: "source1" } },
          // webpackBootstrap frame
          { location: { sourceId: "source2" } }
        ],
        sources: fromJS({
          source1: {
            id: "source1",
            url: "webpack:///webpack/bootstrap 01d88449ca6e9335a66f"
          },
          source2: { id: "source2", url: "https://foo.com/bundle.js" }
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

      expect(frames).toEqual([
        [
          expect.objectContaining(state.frames[0]),
          expect.objectContaining(state.frames[1]),
          expect.objectContaining(state.frames[2])
        ]
      ]);
    });

    describe("groups Babel frames for transforming async functions", () => {
      // eslint-disable-next-line max-nested-callbacks
      it("breaking before an await call", () => {
        const state = {
          frames: [
            {
              displayName: "_callee2$",
              location: { sourceId: "source1" }
            },
            {
              displayName: "tryCatch",
              location: { sourceId: "source1" }
            },
            {
              displayName: "invoke",
              location: { sourceId: "source1" }
            },
            {
              displayName: "defineIteratorMethods/</prototype[method]",
              location: { sourceId: "source1" }
            },
            {
              displayName: "step",
              location: { sourceId: "source1" }
            },
            {
              displayName: "_asyncToGenerator/</<",
              location: { sourceId: "source1" }
            },
            {
              displayName: "Promise",
              location: { sourceId: "source1" }
            },
            {
              displayName: "_asyncToGenerator/<",
              location: { sourceId: "source1" }
            }
          ],
          sources: fromJS({
            source1: { id: "source1", url: "https://foo.com/bundle.js" }
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

        // Expect all the frames to still be ungrouped
        expect(frames).toEqual(state.frames.map(expect.objectContaining));
      });

      // eslint-disable-next-line max-nested-callbacks
      it("breaking after an await call", () => {
        const state = {
          frames: [
            {
              displayName: "_callee2$",
              location: { sourceId: "source1" }
            },
            {
              displayName: "tryCatch",
              location: { sourceId: "source1" }
            },
            {
              displayName: "invoke",
              location: { sourceId: "source1" }
            },
            {
              displayName: "defineIteratorMethods/</prototype[method]",
              location: { sourceId: "source1" }
            },
            {
              displayName: "step",
              location: { sourceId: "source1" }
            },
            {
              displayName: "step/<",
              location: { sourceId: "source1" }
            },
            {
              displayName: "run",
              location: { sourceId: "source1" }
            },
            {
              displayName: "notify/<",
              location: { sourceId: "source1" }
            },
            {
              displayName: "flush",
              location: { sourceId: "source1" }
            }
          ],
          sources: fromJS({
            source1: { id: "source1", url: "https://foo.com/bundle.js" }
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

        // Expect all the frames to still be ungrouped
        expect(frames).toEqual(state.frames.map(expect.objectContaining));
      });
    });
  });
});
