const fs = require("fs");
const path = require("path");

export function getSourceText(name, type = "js") {
  const text = fs.readFileSync(
    path.join(__dirname, `../fixtures/${name}.${type}`),
    "utf8"
  );
  const contentType = type === "html" ? "text/html" : "text/javascript";
  return {
    id: name,
    text,
    contentType
  };
}
