function getIndentation(lines) {
  const firstLine = lines[0];
  const secondLine = lines[1];
  const lastLine = lines[lines.length - 1];

  const _getIndentation = line => line && line.match(/^\s*/)[0].length;

  const indentations = [
    _getIndentation(firstLine),
    _getIndentation(secondLine),
    _getIndentation(lastLine)
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
