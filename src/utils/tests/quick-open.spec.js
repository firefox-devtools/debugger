import cases from "jest-in-case";
import { parseQuickOpenQuery } from "../quick-open";

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
