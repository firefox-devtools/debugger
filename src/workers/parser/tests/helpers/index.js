/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

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
