import fromJS from "../fromJS";

jest.mock("../scopes");
jest.mock("../parser");
import { getSelectedExpression } from "../editor/expression";

describe("utils/editor/expression", function() {
  describe("getSelectedExpression", function() {
    let codeMirror, token;
    let selectedFrame, pauseData, sourceText;

    beforeEach(function() {
      require("../scopes").getVisibleVariablesFromScope.mockReturnValue(new Map([["a", "aa"]]));

      codeMirror = {
        coordsChar: jest.fn(() => ({ line: 35, ch: 50 })),
      };

      token = {
        getBoundingClientRect: jest.fn(
          () => ({ left: 5, top: 5, width: 50, height: 50 })
        ),
      };

      selectedFrame = {};
      pauseData = fromJS({});
      sourceText = fromJS({});
    });

    it("returns variables", async function() {
      token.textContent = "a";

      const expression = await getSelectedExpression(
        codeMirror, token, { selectedFrame, pauseData, sourceText }
      );
      expect(expression).toBe("aa");
      expect(require("../scopes").getVisibleVariablesFromScope)
        .toHaveBeenCalledWith(pauseData, selectedFrame);
      expect(require("../parser").getExpression).not.toHaveBeenCalled();
    });

    it("returns expressions", async function() {
      require("../parser").getExpression.mockReturnValueOnce(Promise.resolve("expression"));
      token.textContent = "b";

      const expression = await getSelectedExpression(
        codeMirror, token, { selectedFrame, pauseData, sourceText }
      );
      expect(expression).toBe("expression");
      expect(require("../scopes").getVisibleVariablesFromScope)
        .toHaveBeenCalledWith(pauseData, selectedFrame);
      expect(require("../parser").getExpression).toHaveBeenCalled();
    });

    it("returns nothing", async function() {
      token.textContent = "b";

      const expression = await getSelectedExpression(
        codeMirror, token, { selectedFrame, pauseData, sourceText }
      );
      expect(expression).toBeNull();
      expect(require("../scopes").getVisibleVariablesFromScope)
        .toHaveBeenCalledWith(pauseData, selectedFrame);
      expect(require("../parser").getExpression).toHaveBeenCalled();
    });
  });
});
