const expect = require("expect.js");
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
      expect(count).to.be(3);
    });

    it("counts basic string match case-sensitive", () => {
      const text = "the Test string with test in it multiple times test.";
      const query = "Test";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      });
      expect(count).to.be(1);
    });

    it("counts whole word string match", () => {
      const text =
        "the test string with test in it multiple times whoatestthe.";
      const query = "test";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: true,
        regexMatch: false
      });
      expect(count).to.be(2);
    });

    it("counts regex match", () => {
      const text =
        "the test string with test in it multiple times whoatestthe.";
      const query = "(\\w+)\\s+(\\w+)";
      const count = countMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: true
      });
      expect(count).to.be(5);
    });
  });

  describe("getMatchIndex", () => {
    it("iterates in the matches", () => {
      const count = 3;

      let matchIndex = getMatchIndex(count, 2, true);
      expect(matchIndex).to.be(1);

      matchIndex = getMatchIndex(count, 1, true);
      expect(matchIndex).to.be(0);

      matchIndex = getMatchIndex(count, 0, true);
      expect(matchIndex).to.be(3);

      matchIndex = getMatchIndex(count, 1, false);
      expect(matchIndex).to.be(2);

      matchIndex = getMatchIndex(count, 3, false);
      expect(matchIndex).to.be(0);
    });
  });
});
