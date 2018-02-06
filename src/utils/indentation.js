/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

export function getIndentationLength(line) {
  return line && line.match(/^\s*/)[0].length;
}

function getIndentation(lines) {
  const firstLine = lines[0];
  const secondLine = lines[1];
  const lastLine = lines[lines.length - 1];

  const indentations = [
    getIndentationLength(firstLine),
    getIndentationLength(secondLine),
    getIndentationLength(lastLine)
  ];

  return Math.max(...indentations);
}

export function correctIndentation(text) {
  const lines = text.trim().split("\n");
  const indentation = getIndentation(lines);
  const formattedLines = lines.map(_line =>
    _line.replace(new RegExp(`^\\s{0,${indentation - 1}}`), "")
  );

  return formattedLines.join("\n");
}
