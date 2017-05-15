import expect from "expect.js";

import { createStore, selectors, actions } from "../../utils/test-head";
import {
  simulateCorrectThreadClient,
  simpleMockThreadClient
} from "./helpers/breakpoints.js";

describe("breakpoints", () => {
  it("should add a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const loc1 = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc1));
    const bps = selectors.getBreakpoints(getState());
    const bp = selectors.getBreakpoint(getState(), loc1);
    expect(bps.size).to.be(1);
    expect(bp.location).to.eql(loc1);
  });

  it("should not re-add a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const loc1 = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc1));
    let bps = selectors.getBreakpoints(getState());
    const bp = selectors.getBreakpoint(getState(), loc1);
    expect(bps.size).to.be(1);
    expect(bp.location).to.eql(loc1);

    await dispatch(actions.addBreakpoint(loc1));
    bps = selectors.getBreakpoints(getState());
    expect(bps.size).to.be(1);
  });

  describe("adding a breakpoint to an invalid location", async () => {
    it("adds only one breakpoint with a corrected location", async () => {
      const invalidLocation = { sourceId: "a", line: 5 };
      const {
        correctedThreadClient,
        correctedLocation
      } = simulateCorrectThreadClient(2, invalidLocation);
      const { dispatch, getState } = createStore(correctedThreadClient);

      await dispatch(actions.addBreakpoint(invalidLocation));
      const state = getState();
      const bps = selectors.getBreakpoints(state);
      const bp = selectors.getBreakpoint(state, correctedLocation);
      expect(bps.size).to.be(1);
      expect(bp.location).to.eql(correctedLocation);
    });
  });

  it("should remove a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc1 = { sourceId: "a", line: 5 };
    const loc2 = { sourceId: "b", line: 6 };

    await dispatch(actions.addBreakpoint(loc1));
    await dispatch(actions.addBreakpoint(loc2));

    await dispatch(actions.removeBreakpoint(loc1));

    expect(selectors.getBreakpoints(getState()).size).to.be(1);
  });

  it("should disable a breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc1 = { sourceId: "a", line: 5 };
    const loc2 = { sourceId: "b", line: 6 };

    await dispatch(actions.addBreakpoint(loc1));
    await dispatch(actions.addBreakpoint(loc2));

    await dispatch(actions.disableBreakpoint(loc1));

    expect(selectors.getBreakpoint(getState(), loc1).disabled).to.be(true);
  });

  it("should enable breakpoint", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);
    const loc = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc));
    await dispatch(actions.disableBreakpoint(loc));

    expect(selectors.getBreakpoint(getState(), loc).disabled).to.be(true);

    await dispatch(actions.enableBreakpoint(loc));

    expect(selectors.getBreakpoint(getState(), loc).disabled).to.be(false);
  });

  it("should toggle all the breakpoints", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc1 = { sourceId: "a", line: 5 };
    const loc2 = { sourceId: "b", line: 6 };

    await dispatch(actions.addBreakpoint(loc1));
    await dispatch(actions.addBreakpoint(loc2));

    await dispatch(actions.toggleAllBreakpoints(true));

    expect(selectors.getBreakpoint(getState(), loc1).disabled).to.be(true);
    expect(selectors.getBreakpoint(getState(), loc2).disabled).to.be(true);

    await dispatch(actions.toggleAllBreakpoints());

    expect(selectors.getBreakpoint(getState(), loc1).disabled).to.be(false);
    expect(selectors.getBreakpoint(getState(), loc2).disabled).to.be(false);
  });

  it("should set the breakpoint condition", async () => {
    const { dispatch, getState } = createStore(simpleMockThreadClient);

    const loc = { sourceId: "a", line: 5 };

    await dispatch(actions.addBreakpoint(loc));

    expect(selectors.getBreakpoint(getState(), loc).condition).to.be(null);

    await dispatch(
      actions.setBreakpointCondition(loc, {
        condition: "const foo = 0",
        getTextForLine: () => {}
      })
    );

    expect(selectors.getBreakpoint(getState(), loc).condition).to.be(
      "const foo = 0"
    );
  });
});
