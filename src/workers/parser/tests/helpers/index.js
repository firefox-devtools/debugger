import fs from "fs";
import path from "path";

export function getSource(name, type = "js") {
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

export function getOriginalSource(name, type) {
  const source = getSource(name, type);
  return { ...source, id: `${name}-original` };
}
