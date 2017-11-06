/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { findFunctionText } from "../function";

import getSymbols from "../../workers/parser/getSymbols";
import { getSource } from "../../workers/parser/tests/helpers";

describe("function", () => {
  describe("findFunctionText", () => {
    it("finds function", () => {
      const source = getSource("func");
      const symbols = getSymbols(source);

      const text = findFunctionText(14, source, symbols);
      expect(text).toMatchSnapshot();
    });

    it("finds function signature", () => {
      const source = getSource("func");
      const symbols = getSymbols(source);

      const text = findFunctionText(13, source, symbols);
      expect(text).toMatchSnapshot();
    });

    it("misses function closing brace", () => {
      const source = getSource("func");
      const symbols = getSymbols(source);

      const text = findFunctionText(15, source, symbols);

      // TODO: we should try and match the closing bracket.
      expect(text).toEqual(null);
    });

    it("finds property function", () => {
      const source = getSource("func");
      const symbols = getSymbols(source);

      const text = findFunctionText(25, source, symbols);
      expect(text).toMatchSnapshot();
    });

    it("finds class function", () => {
      const source = getSource("func");
      const symbols = getSymbols(source);

      const text = findFunctionText(29, source, symbols);
      expect(text).toMatchSnapshot();
    });

    it("cant find function", () => {
      const source = getSource("func");
      const symbols = getSymbols(source);

      const text = findFunctionText(17, source, symbols);
      expect(text).toEqual(null);
    });
  });
});
