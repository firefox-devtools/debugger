/* eslint max-nested-callbacks: ["error", 4]*/
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { isInvalidPauseLocation } from "../pauseLocation";
import { setSource } from "../sources";
import { getOriginalSource } from "./helpers";
import cases from "jest-in-case";

cases(
  "Parser.isInvalidPauseLocation",
  ({ name, file, valid, invalid }) => {
    const source = getOriginalSource(file);
    setSource(source);

    valid.forEach(([line, column]) => {
      const scopes = isInvalidPauseLocation({
        sourceId: source.id,
        line,
        column
      });

      expect(scopes).toBe(false, `line ${line} column ${column} valid`);
    });

    invalid.forEach(([line, column]) => {
      const scopes = isInvalidPauseLocation({
        sourceId: source.id,
        line,
        column
      });

      expect(scopes).toBe(true, `line ${line} column ${column} invalid`);
    });
  },
  [
    {
      name: "finds valid and invalid locations in functions",
      file: "pause/functions",
      valid: [[3, 0], [5, 0], [7, 0], [7, 10], [8, 0]],
      invalid: [[2, 6], [2, 25], [2, 31], [7, 14], [7, 41]]
    },
    {
      name: "finds valid and invalid locations in blocks",
      file: "pause/blocks",
      valid: [[1, 0], [2, 0], [3, 0]],
      invalid: [[2, 22]]
    }
  ]
);
