import { getNextStep } from "../steps";
import { getSource } from "./helpers";

describe("getNextStep", () => {
  describe("await", () => {
    it("first await call", () => {
      const source = getSource("async");
      const pausePosition = { line: 8, column: 2, sourceId: "async" };
      expect(getNextStep(source, pausePosition)).toEqual({
        ...pausePosition,
        line: 9
      });
    });

    it("first await call expression", () => {
      const source = getSource("async");
      const pausePosition = { line: 8, column: 9, sourceId: "async" };
      expect(getNextStep(source, pausePosition)).toEqual({
        ...pausePosition,
        line: 9,
        column: 2
      });
    });

    it("second await call", () => {
      const source = getSource("async");
      const pausePosition = { line: 9, column: 2, sourceId: "async" };
      expect(getNextStep(source, pausePosition)).toEqual(null);
    });

    it("second call expression", () => {
      const source = getSource("async");
      const pausePosition = { line: 9, column: 9, sourceId: "async" };
      expect(getNextStep(source, pausePosition)).toEqual(null);
    });
  });

  describe("yield", () => {
    it("first yield call", () => {
      const source = getSource("generators");
      const pausePosition = { line: 2, column: 2, sourceId: "generators" };
      expect(getNextStep(source, pausePosition)).toEqual({
        ...pausePosition,
        line: 3
      });
    });

    it("second yield call", () => {
      const source = getSource("generators");
      const pausePosition = { line: 3, column: 2, sourceId: "generators" };
      expect(getNextStep(source, pausePosition)).toEqual(null);
    });
  });
});
