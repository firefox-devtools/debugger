import getMatches from "../get-matches";

describe("search", () => {
  describe("getMatches", () => {
    it("gets basic string match", () => {
      const text = "the test string with test in it multiple times test.";
      const query = "test";
      const matchLocations = getMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      });
      expect(matchLocations.length).toBe(3);
    });

    it("gets basic string match case-sensitive", () => {
      const text = "the Test string with test in it multiple times test.";
      const query = "Test";
      const matchLocations = getMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: false
      });
      expect(matchLocations.length).toBe(1);
    });

    it("gets whole word string match", () => {
      const text = "the test string test in it multiple times whoatestthe.";
      const query = "test";
      const matchLocations = getMatches(query, text, {
        caseSensitive: true,
        wholeWord: true,
        regexMatch: false
      });
      expect(matchLocations.length).toBe(2);
    });

    it("gets regex match", () => {
      const text = "the test string test in it multiple times whoatestthe.";
      const query = "(\\w+)\\s+(\\w+)";
      const matchLocations = getMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: true
      });
      expect(matchLocations.length).toBe(4);
    });

    it("it doesnt fail on empty data", () => {
      const text = "";
      const query = "";
      const matchLocations = getMatches(query, text, {
        caseSensitive: true,
        wholeWord: false,
        regexMatch: true
      });
      expect(matchLocations.length).toBe(0);
    });
  });
});
