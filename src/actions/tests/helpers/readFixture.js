import fs from "fs";
import path from "path";

export default function readFixture(name) {
  const text = fs.readFileSync(
    path.join(__dirname, `../fixtures/${name}`),
    "utf8"
  );
  return text;
}
