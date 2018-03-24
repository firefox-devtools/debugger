import fs from "fs";
import path from "path";

export function getSource(name, type = "js") {
  const text = fs.readFileSync(
    path.join(__dirname, `../fixtures/${name}.${type}`),
    "utf8"
  );
  let contentType = "text/javascript";
  if (type === "html") {
    contentType = "text/html";
  } else if (type === "ts") {
    contentType = "text/typescript";
  }

  return {
    id: name,
    text,
    contentType
  };
}

export function getOriginalSource(name, type) {
  const source = getSource(name, type);
  return { ...source, id: `${name}/originalSource-1` };
}
