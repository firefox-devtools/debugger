import countMatches from "../count-matches";

describe("search", () => {
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
});
