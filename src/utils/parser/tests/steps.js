import { getNextStep } from "../steps";
import { getSource } from "./helpers";

describe("parser - steps", () => {
  it("basic", async () => {
    const source = getSource("async");
    const pausedPosition = { line: 3, column: 2 };
    const { nextStepType, nextHiddenBreakpointLocation } = await getNextStep(
      source,
      "stepIn",
      pausedPosition
    );

    expect(nextStepType).toEqual("resume");
    expect(nextHiddenBreakpointLocation).toEqual({
      line: 4,
      column: 0,
      sourceId: undefined
    });
  });

  xit("test other step types");

  it("test non-wait expressions", async () => {
    const source = getSource("async");
    const pausedPosition = { line: 2, column: 2 };
    const { nextStepType, nextHiddenBreakpointLocation } = await getNextStep(
      source,
      "stepIn",
      pausedPosition
    );

    expect(nextStepType).toEqual("stepIn");
    expect(nextHiddenBreakpointLocation).toEqual(undefined);
  });
});
