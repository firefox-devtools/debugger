/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import uniq from "lodash/uniq";
import difference from "lodash/difference";
import { getAst } from "./utils/ast";

const commentTokens = ["CommentBlock", "CommentLine"];

function fillRange(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((item, index) => start + index);
}

// Populates a pre-filled array of every line number,
// then removes lines which were found to be executable
function getLines(ast) {
  return fillRange(1, ast.tokens[ast.tokens.length - 1].loc.end.line);
}

// The following sequence stores lines which have executable code
// (contents other than comments or EOF, regardless of line position)
function getExecutableLines(ast) {
  const lines = ast.tokens
    .filter(
      token =>
        !commentTokens.includes(token.type) &&
        (!token.type || (token.type.label && token.type.label != "eof"))
    )
    .map(token => token.loc.start.line);

  return uniq(lines);
}

export default function getEmptyLines(sourceToJS) {
  if (!sourceToJS) {
    return null;
  }

  const ast = getAst(sourceToJS);
  if (!ast || !ast.comments) {
    return [];
  }

  const executableLines = getExecutableLines(ast);
  const lines = getLines(ast);
  return difference(lines, executableLines);
}
