import { getASTLocation } from "../astBreakpointLocation.js";
import { getSource } from "../../parser/tests/helpers";
import * as I from "immutable";

describe("ast", () => {
  describe("valid location", () => {
    it("returns the scope and offset", async () => {
      const source = I.Map(getSource("math"));

      const location = { line: 6, column: 0 };
      const astLocation = await getASTLocation(source, location);
      const offset = astLocation.scope.location.start;
      expect(astLocation.scope.name).toBe("math");
      expect(astLocation.offset.line).toBe(location.line - offset.line);
      expect(astLocation.offset.column).toBe(location.column);
      expect(astLocation).toMatchSnapshot();
    });
  });
  describe("invalid location", () => {
    it("returns the scope and offset", async () => {
      const source = I.Map(getSource("class"));
      const location = { line: 11, column: 0 };
      const astLocation = await getASTLocation(source, location);
      expect(astLocation.scope.name).toBe(undefined);
      expect(astLocation.offset.line).toBe(location.line);
      expect(astLocation.offset.column).toBe(location.column);
      expect(astLocation).toMatchSnapshot();
    });
  });
});
