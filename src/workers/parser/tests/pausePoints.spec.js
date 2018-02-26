/* eslint max-nested-callbacks: ["error", 4]*/

import { getPausePoints } from "../pausePoints";
import { setSource } from "../sources";
import { getOriginalSource } from "./helpers";
import { reverse } from "lodash";

function insertStrtAt(string, index, newString) {
  const start = string.slice(0, index);
  const end = string.slice(index);
  return `${start}${newString}${end}`;
}

function formatText(text, nodes) {
  nodes = reverse(nodes);
  const lines = text.split("\n");
  nodes.forEach((node, index) => {
    const { line, column } = node.location;
    const { breakpoint, stepOver } = node.types;
    const num = nodes.length - index;
    const types = `${breakpoint ? "b" : ""}${stepOver ? "s" : ""}`;
    lines[line - 1] = insertStrtAt(
      lines[line - 1],
      column,
      `/*${types} ${num}*/`
    );
  });

  return lines.join("\n");
}

describe("Parser.pausePoints", () => {
  it("pause-points", () => {
    const source = getOriginalSource("pause-points");
    setSource(source);
    const nodes = getPausePoints(source.id);
    expect(formatText(source.text, nodes)).toMatchSnapshot();
  });
});
