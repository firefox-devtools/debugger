import { chain, difference } from "lodash";
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
  return fillRange(0, ast.tokens[ast.tokens.length - 1].loc.end.line);
}

// The following sequence stores lines which have executable code
// (contents other than comments or EOF, regardless of line position)
function getExecutableLines(ast) {
  return chain(ast.tokens)
    .filter(
      token =>
        !commentTokens.includes(token.type) &&
        (!token.type || (token.type.label && token.type.label != "eof"))
    )
    .map(token => token.loc.start.line - 1)
    .uniq()
    .value();
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
