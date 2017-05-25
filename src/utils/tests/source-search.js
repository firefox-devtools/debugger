const { countMatches } = require("../editor");
const { getMatchIndex } = require("../editor/source-search");

describe("source-search", () => {
  describe("countMatches", () => {
    it("counts basic string match", () => {
      const text = "the test string with test in it multiple times test.";
      const query = "test";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      });
      expect(count).toBe(3);
    });

    it("counts basic string match case-sensitive", () => {
      const text = "the Test string with test in it multiple times test.";
      const query = "Test";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      });
      expect(count).toBe(1);
    });

    it("counts whole word string match", () => {
      const text = "the test string test in it multiple times whoatestthe.";
      const query = "test";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: true,
        regexMatch: false
      });
      expect(count).toBe(2);
    });

    it("counts regex match", () => {
      const text = "the test string test in it multiple times whoatestthe.";
      const query = "(\\w+)\\s+(\\w+)";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: true
      });
      expect(count).toBe(4);
    });
  });

  describe("getMatchIndex", () => {
    it("iterates in the matches", () => {
      const count = 3;

      // reverse 2, 1, 0, 2

      let matchIndex = getMatchIndex(count, 2, true);
      expect(matchIndex).toBe(1);

      matchIndex = getMatchIndex(count, 1, true);
      expect(matchIndex).toBe(0);

      matchIndex = getMatchIndex(count, 0, true);
      expect(matchIndex).toBe(2);

      // forward 1, 2, 0, 1

      matchIndex = getMatchIndex(count, 1, false);
      expect(matchIndex).toBe(2);

      matchIndex = getMatchIndex(count, 2, false);
      expect(matchIndex).toBe(0);

      matchIndex = getMatchIndex(count, 0, false);
      expect(matchIndex).toBe(1);
    });
  });
});
