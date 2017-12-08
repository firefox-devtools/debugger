import { getAst } from "../ast";
import cases from "jest-in-case";

function createSource(contentType) {
  return { id: "foo", text: "2", contentType };
}

const astKeys = [
  "type",
  "start",
  "end",
  "loc",
  "program",
  "comments",
  "tokens"
];

cases(
  "ast.getAst",
  ({ name }) =>
    expect(Object.keys(getAst(createSource(name)))).toEqual(astKeys),
  [
    { name: "text/javascript" },
    { name: "application/javascript" },
    { name: "application/x-javascript" },
    { name: "text/jsx" }
  ]
);
