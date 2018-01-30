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
  ({ input, query, value }) =>
    expect(groupFuzzyMatches(input, query)).toEqual(value),
  [
    {
      input: "anonymous",
      query: "ano",
      value: [
        { type: "match", value: "anon" },
        { type: "miss", value: "ym" },
        { type: "match", value: "o" },
        { type: "miss", value: "us" }
      ]
    },
    {
      input: "previousAttributes",
      query: "prva",
      value: [
        { type: "match", value: "pr" },
        { type: "miss", value: "e" },
        { type: "match", value: "v" },
        { type: "miss", value: "ious" },
        { type: "match", value: "A" },
        { type: "miss", value: "tt" },
        { type: "match", value: "r" },
        { type: "miss", value: "ibutes" }
      ]
    },
    { input: "super", query: "x", value: [{ type: "miss", value: "super" }] }
  ]
);
