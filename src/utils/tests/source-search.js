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
    it("finds first item", () => {
      const items = [
        { type: "apple" }, { type: "banana" }, { type: "tomato" }
      ];
      const state = {
        results: items,
        matchIndex: -1
      };

      let matchIndex = getMatchIndex(state, true, { type: "apple" });
      expect(matchIndex).to.be(0);

      matchIndex = getMatchIndex(state, true, { type: "banana" });
      expect(matchIndex).to.be(1);
    });

    it("iterates in the matches", () => {
      const items = [
        { type: "apple" },
        { type: "banana" },
        { type: "tomato" }
      ];

      let state = {
        results: items,
        matchIndex: 2
      };

      let matchIndex = getMatchIndex(state, true, { type: "apple" });
      expect(matchIndex).to.be(1);

      state = {
        results: items,
        matchIndex: 1
      };

      matchIndex = getMatchIndex(state, false, { type: "banana" });
      expect(matchIndex).to.be(2);
    });

    it("wraps matches", () => {
      const items = [
        { type: "apple" },
        { type: "banana" },
        { type: "tomato" }
      ];

      let state = {
        results: items,
        matchIndex: 1
      };

      let matchIndex = getMatchIndex(state, true, { type: "apple" });
      expect(matchIndex).to.be(3);

      state = {
        results: items,
        matchIndex: 3
      };

      matchIndex = getMatchIndex(state, false, { type: "banana" });
      expect(matchIndex).to.be(1);
    });
  });
});
