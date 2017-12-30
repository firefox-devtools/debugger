/* eslint max-nested-callbacks: ["error", 4] */

import { getFramePopVariables } from "../utils";

const errorGrip = {
  type: "object",
  actor: "server2.conn66.child1/pausedobj243",
  class: "Error",
  extensible: true,
  frozen: false,
  sealed: false,
  ownPropertyLength: 4,
  preview: {
    kind: "Error",
    name: "Error",
    message: "blah",
    stack:
      "onclick@http://localhost:8000/examples/doc-return-values.html:1:18\n",
    fileName: "http://localhost:8000/examples/doc-return-values.html",
    lineNumber: 1,
    columnNumber: 18
  }
};

function returnWhy(grip) {
  return {
    type: "resumeLimit",
    frameFinished: {
      return: grip
    }
  };
}

function throwWhy(grip) {
  return {
    type: "resumeLimit",
    frameFinished: {
      throw: grip
    }
  };
}
describe("pause - scopes", () => {
  describe("getFramePopVariables", () => {
    describe("falsey values", () => {
      // NOTE: null and undefined are treated like objects and given a type
      const falsey = { false: false, "0": 0, null: { type: "null" } };
      for (const test in falsey) {
        const value = falsey[test];
        it(`shows ${test} returns`, () => {
          const why = returnWhy(value);
          const vars = getFramePopVariables(why, "");
          expect(vars[0].name).toEqual("<return>");
          expect(vars[0].name).toEqual("<return>");
          expect(vars[0].contents.value).toEqual(value);
        });

        it(`shows ${test} throws`, () => {
          const why = throwWhy(value);
          const vars = getFramePopVariables(why, "");
          expect(vars[0].name).toEqual("<exception>");
          expect(vars[0].name).toEqual("<exception>");
          expect(vars[0].contents.value).toEqual(value);
        });
      }
    });

    describe("Error / Objects", () => {
      it("shows Error returns", () => {
        const why = returnWhy(errorGrip);
        const vars = getFramePopVariables(why, "");
        expect(vars[0].name).toEqual("<return>");
        expect(vars[0].name).toEqual("<return>");
        expect(vars[0].contents.value.class).toEqual("Error");
      });

      it("shows error throws", () => {
        const why = throwWhy(errorGrip);
        const vars = getFramePopVariables(why, "");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].contents.value.class).toEqual("Error");
      });
    });

    describe("undefined", () => {
      it("does not show undefined returns", () => {
        const why = returnWhy({ type: "undefined" });
        const vars = getFramePopVariables(why, "");
        expect(vars.length).toEqual(0);
      });

      it("shows undefined throws", () => {
        const why = throwWhy({ type: "undefined" });
        const vars = getFramePopVariables(why, "");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].contents.value).toEqual({ type: "undefined" });
      });
    });
  });
});
