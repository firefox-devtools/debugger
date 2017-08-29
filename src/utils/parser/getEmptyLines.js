import { uniq } from "lodash";
import { getAst } from "./utils/ast";

const commentTokens = ["CommentBlock", "CommentLine"];

export default function getEmptyLines(sourceToJS) {
  if (!sourceToJS) {
    return null;
  }

  const ast = getAst(sourceToJS);
  if (!ast || !ast.comments) {
    return [];
  }

  // The following sequence stores lines which have executable code
  // (contents other than comments or EOF, regardless of line position)
  const executableLines = ast.tokens
    .filter(token => {
      return (
        !commentTokens.includes(token.type) &&
        (!token.type || (token.type.label && token.type.label != "eof"))
      );
    })
    .map(token => token.loc.start.line - 1);
  executableLines = uniq(executableLines);

  // Populates a pre-filled array of every line number,
  // then removes lines which were found to be executable
  const fillRange = (start, end) => {
    return Array(end - start + 1).fill().map((item, index) => start + index);
  };
  const allLines = fillRange(0, ast.tokens[ast.tokens.length - 1].loc.end.line);

  return allLines.filter(i => !executableLines.includes(i));
}
