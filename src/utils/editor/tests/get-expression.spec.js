/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { getExpressionFromCoords } from "../get-expression";

describe("get-expression", () => {
  describe("getExpressionFromCoords", () => {
    it("returns null when location.line is greater than the lineCount", () => {
      const lineCount = 1;
      const codemirrorMock = {
        lineCount: () => lineCount
      };
      const result = getExpressionFromCoords(codemirrorMock, {
        line: lineCount + 1,
        column: 1
      });
      expect(result).toBeNull();
    });

    it("gets the expression using CodeMirror.getTokenAt", () => {
      const codemirrorMock = {
        lineCount: () => 100,
        getTokenAt: jest.fn(() => ({ start: 0, end: 0 })),
        doc: {
          getLine: () => ""
        }
      };
      getExpressionFromCoords(codemirrorMock, { line: 1, column: 1 });
      expect(codemirrorMock.getTokenAt).toHaveBeenCalled();
    });

    it("requests the correct line and column from codeMirror", () => {
      const codemirrorMock = {
        lineCount: () => 100,
        getTokenAt: jest.fn(() => ({ start: 0, end: 1 })),
        doc: {
          getLine: jest.fn(() => "")
        }
      };
      getExpressionFromCoords(codemirrorMock, { line: 20, column: 5 });
      // getExpressionsFromCoords uses one based line indexing
      // CodeMirror uses zero based line indexing
      expect(codemirrorMock.getTokenAt).toHaveBeenCalledWith({
        line: 19,
        ch: 5
      });
      expect(codemirrorMock.doc.getLine).toHaveBeenCalledWith(19);
    });

    it("when called with column 0 returns null", () => {
      const codemirrorMock = {
        lineCount: () => 2,
        getTokenAt: jest.fn(() => ({ start: 0, end: 0, type: null })),
        doc: {
          getLine: () => "foo bar;"
        }
      };

      const result = getExpressionFromCoords(codemirrorMock, {
        line: 1,
        column: 0
      });
      expect(codemirrorMock.getTokenAt).toHaveBeenCalledWith({
        line: 0,
        ch: 0
      });
      expect(result).toBeNull();
    });

    it("gets the expression when first token on the line", () => {
      const codemirrorMock = {
        lineCount: () => 2,
        getTokenAt: () => ({ start: 0, end: 3 }),
        doc: {
          getLine: () => "foo bar;"
        }
      };

      const result = getExpressionFromCoords(codemirrorMock, {
        line: 1,
        column: 1
      });
      expect(result.expression).toEqual("foo");
      expect(result.location.start).toEqual({ line: 1, column: 0 });
      expect(result.location.end).toEqual({ line: 1, column: 3 });
    });

    it("gets the expression when not the first token on the line", () => {
      const codemirrorMock = {
        lineCount: () => 2,
        getTokenAt: () => ({ start: 4, end: 7 }),
        doc: {
          getLine: () => "foo bar;"
        }
      };

      const result = getExpressionFromCoords(codemirrorMock, {
        line: 1,
        column: 5
      });
      expect(result.expression).toEqual("bar");
      expect(result.location.start).toEqual({ line: 1, column: 4 });
      expect(result.location.end).toEqual({ line: 1, column: 7 });
    });

    it("includes previous tokens in the expression", () => {
      const codemirrorMock = {
        lineCount: () => 2,
        getTokenAt: location => {
          if (location.ch >= 5 && location.ch <= 7) {
            return { start: 4, end: 7, type: "property" };
          } else if (location.ch >= 1 && location.ch <= 3) {
            return { start: 0, end: 3, type: "variable" };
          }
        },
        doc: {
          getLine: () => "foo.bar;"
        }
      };

      const result = getExpressionFromCoords(codemirrorMock, {
        line: 1,
        column: 5
      });
      expect(result.expression).toEqual("foo.bar");
      expect(result.location.start).toEqual({ line: 1, column: 0 });
      expect(result.location.end).toEqual({ line: 1, column: 7 });
    });

    it("includes multiple previous tokens in the expression", () => {
      const codemirrorMock = {
        lineCount: () => 2,
        getTokenAt: location => {
          if (location.ch >= 9 && location.ch <= 11) {
            return { start: 8, end: 11, type: "property" };
          } else if (location.ch >= 5 && location.ch <= 7) {
            return { start: 4, end: 7, type: "property" };
          } else if (location.ch >= 1 && location.ch <= 3) {
            return { start: 0, end: 3, type: "variable" };
          }
        },
        doc: {
          getLine: () => "foo.bar.baz;"
        }
      };

      const result = getExpressionFromCoords(codemirrorMock, {
        line: 1,
        column: 10
      });
      expect(result.expression).toEqual("foo.bar.baz");
      expect(result.location.start).toEqual({ line: 1, column: 0 });
      expect(result.location.end).toEqual({ line: 1, column: 11 });
    });

    it("does not include tokens not part of the expression", () => {
      const codemirrorMock = {
        lineCount: () => 2,
        getTokenAt: location => {
          if (location.ch >= 9 && location.ch <= 11) {
            return { start: 8, end: 11, type: "property" };
          } else if (location.ch >= 5 && location.ch <= 7) {
            return { start: 4, end: 7, type: "variable" };
          } else if (location.ch >= 1 && location.ch <= 3) {
            return { start: 0, end: 3, type: "variable" };
          }
        },
        doc: {
          getLine: () => "foo bar.baz;"
        }
      };

      const result = getExpressionFromCoords(codemirrorMock, {
        line: 1,
        column: 10
      });
      expect(result.expression).toEqual("bar.baz");
      expect(result.location.start).toEqual({ line: 1, column: 4 });
      expect(result.location.end).toEqual({ line: 1, column: 11 });
    });
  });
});
