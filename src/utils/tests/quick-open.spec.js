import cases from "jest-in-case";
import {
  groupFuzzyMatches,
  parseQuickOpenQuery,
  parseLineColumn
} from "../quick-open";

cases(
  "parseQuickOpenQuery utility",
  ({ type, query }) => expect(parseQuickOpenQuery(query)).toEqual(type),
  [
    { name: "empty query defaults to sources", type: "sources", query: "" },
    { name: "sources query", type: "sources", query: "test" },
    { name: "functions query", type: "functions", query: "@test" },
    { name: "variables query", type: "variables", query: "#test" },
    { name: "goto line", type: "goto", query: ":30" },
    { name: "goto line:column", type: "goto", query: ":30:60" },
    { name: "goto source line", type: "gotoSource", query: "test:30:60" },
    { name: "shortcuts", type: "shortcuts", query: "?" }
  ]
);

cases(
  "parseLineColumn utility",
  ({ query, location }) => expect(parseLineColumn(query)).toEqual(location),
  [
    { name: "empty query", query: "", location: undefined },
    { name: "just line", query: ":30", location: { line: 30 } },
    {
      name: "line and column",
      query: ":30:90",
      location: { column: 90, line: 30 }
    }
  ]
);

cases(
  "groupFuzzyMatches utility",
  ({ input, matches, value }) =>
    expect(groupFuzzyMatches(input, matches)).toEqual(value),
  [
    {
      input: "anonymous",
      matches: [1, 5, 8],
      value: [
        { type: "miss", value: "a" },
        { type: "match", value: "n" },
        { type: "miss", value: "ony" },
        { type: "match", value: "m" },
        { type: "miss", value: "ou" },
        { type: "match", value: "s" },
        { type: "miss", value: "" }
      ]
    },
    {
      input: "previousAttributes",
      matches: [0, 3, 4, 8, 9, 10, 11, 12, 15],
      value: [
        { type: "miss", value: "" },
        { type: "match", value: "p" },
        { type: "miss", value: "re" },
        { type: "match", value: "vi" },
        { type: "miss", value: "ous" },
        { type: "match", value: "Attri" },
        { type: "miss", value: "bu" },
        { type: "match", value: "t" },
        { type: "miss", value: "es" }
      ]
    },
    { input: "super", matches: [], value: [{ type: "miss", value: "super" }] }
  ]
);
