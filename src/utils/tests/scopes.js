const { getSpecialVariables } = require("../scopes");
const fromJS = require("../fromJS");

const expect = require("expect.js");

const errorGrip = {
  "type": "object",
  "actor": "server2.conn66.child1/pausedobj243",
  "class": "Error",
  "extensible": true,
  "frozen": false,
  "sealed": false,
  "ownPropertyLength": 4,
  "preview": {
    "kind": "Error",
    "name": "Error",
    "message": "blah",
    "stack": "onclick@http://localhost:8000/examples/doc-return-values.html:1:18\n",
    "fileName": "http://localhost:8000/examples/doc-return-values.html",
    "lineNumber": 1,
    "columnNumber": 18
  }
};

function returnWhy(grip) {
  return {
    why: {
      "type": "resumeLimit",
      "frameFinished": {
        "return": grip
      }
    }
  };
}

function throwWhy(grip) {
  return {
    why: {
      "type": "resumeLimit",
      "frameFinished": {
        "throw": grip
      }
    }
  };
}

describe("scopes", () => {
  describe("getSpecialVariables", () => {
    describe("falsey values", () => {
      // NOTE: null and undefined are treated like objects and given a type
      const falsey = { false: false, "0": 0, null: { type: "null" }};
      for (const test in falsey) {
        const value = falsey[test];
        it(`shows ${test} returns`, () => {
          const pauseData = fromJS(returnWhy(value));
          const vars = getSpecialVariables(pauseData, "");
          expect(vars[0].name).to.equal("<return>");
          expect(vars[0].name).to.equal("<return>");
          expect(vars[0].contents.value).to.eql(value);
        });

        it(`shows ${test} throws`, () => {
          const pauseData = fromJS(throwWhy(value));
          const vars = getSpecialVariables(pauseData, "");
          expect(vars[0].name).to.equal("<exception>");
          expect(vars[0].name).to.equal("<exception>");
          expect(vars[0].contents.value).to.eql(value);
        });
      }
    });

    describe("Error / Objects", () => {
      it("shows Error returns", () => {
        const pauseData = fromJS(returnWhy(errorGrip));
        const vars = getSpecialVariables(pauseData, "");
        expect(vars[0].name).to.equal("<return>");
        expect(vars[0].name).to.equal("<return>");
        expect(vars[0].contents.value.class).to.equal("Error");
      });

      it("shows error throws", () => {
        const pauseData = fromJS(throwWhy(errorGrip));
        const vars = getSpecialVariables(pauseData, "");
        expect(vars[0].name).to.equal("<exception>");
        expect(vars[0].name).to.equal("<exception>");
        expect(vars[0].contents.value.class).to.equal("Error");
      });
    });

    describe("undefined", () => {
      it("does not show undefined returns", () => {
        const pauseData = fromJS(returnWhy({ type: "undefined" }));
        const vars = getSpecialVariables(pauseData, "");
        expect(vars.length).to.equal(0);
      });

      it("shows undefined throws", () => {
        const pauseData = fromJS(throwWhy({ type: "undefined" }));
        const vars = getSpecialVariables(pauseData, "");
        expect(vars[0].name).to.equal("<exception>");
        expect(vars[0].name).to.equal("<exception>");
        expect(vars[0].contents.value).to.eql({ type: "undefined" });
      });
    });
  });
});
