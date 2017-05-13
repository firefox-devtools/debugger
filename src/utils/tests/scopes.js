const {
  getSpecialVariables,
  getVisibleVariablesFromScope,
  getScopes
} = require("../scopes");
const fromJS = require("../fromJS");

const expect = require("expect.js");

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
    stack: "onclick@http://localhost:8000/examples/doc-return-values.html:1:18\n",
    fileName: "http://localhost:8000/examples/doc-return-values.html",
    lineNumber: 1,
    columnNumber: 18
  }
};

function returnWhy(grip) {
  return {
    why: {
      type: "resumeLimit",
      frameFinished: {
        return: grip
      }
    }
  };
}

function throwWhy(grip) {
  return {
    why: {
      type: "resumeLimit",
      frameFinished: {
        throw: grip
      }
    }
  };
}

describe("scopes", () => {
  describe("getSpecialVariables", () => {
    describe("falsey values", () => {
      // NOTE: null and undefined are treated like objects and given a type
      const falsey = { false: false, "0": 0, null: { type: "null" } };
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

  describe("getVisibleVariablesFromScope", function() {
    /* These are real-life pauseInfo and frames with some shadowed variables
     * coming from the following JS code:
     *
     * (function() {
     *   var a = 'a';
     *   var b = 'b';
     *   var c = 'c';
     *
     *   function func(b, d) {
     *     var c = 'cc';
     *     debugger; // This is where we are paused.
     *   }
     *
     *   document.querySelector('button').onclick =
     *     () => func.call('this', 'bb', 'dd');
     *  })();
     *
     *
     * We use a IIFE because we don't support global variables yet, so this is
     * necessary to get variables in the outer scope. This can be removed once
     * getVisibleVariablesFromScope supports global variables.
     *
     * `b` is shadowed by a function parameter, `c` is shadowed by a local
     * variable, but `a` is not shadowed. `this` is a string containing te value
     * `"this"`.
     */

    const frame = {
      id: "server2.conn1.frame37",
      displayName: "func",
      this: "this",
      scope: {
        actor: "server2.conn1.environment39",
        type: "function",
        parent: {
          actor: "server2.conn1.environment40",
          type: "function",
          function: {
            type: "object",
            class: "Function",
            actor: "server2.conn1.pausedobj44"
          },
          bindings: {
            arguments: [],
            variables: {
              a: { value: "a" },
              b: { value: "b" },
              c: { value: "c" },
              func: {
                value: {
                  name: "func",
                  displayName: "func",
                  actor: "server2.conn1.pausedobj45",
                  class: "Function",
                  type: "object"
                }
              }
            }
          }
        },
        function: {
          name: "func",
          displayName: "func",
          actor: "server2.conn1.pausedobj45",
          class: "Function",
          type: "object"
        },
        bindings: {
          arguments: [{ b: { value: "bb" } }, { d: { value: "dd" } }],
          variables: {
            c: { value: "cc" }
          }
        }
      }
    };

    let pauseInfo;

    beforeEach(function() {
      // Default pauseInfo is using the innermost frame in the stack.
      pauseInfo = fromJS({
        why: {
          type: "debuggerStatement"
        },
        frame,
        isInterrupted: false
      });
    });

    it("Returns variables from the outer scope", function() {
      const variables = getVisibleVariablesFromScope(pauseInfo, frame);

      const expectations = {
        a: "a",
        b: "bb",
        c: "cc",
        d: "dd"
      };

      for (const variableName in expectations) {
        const variable = variables.get(variableName);
        expect(variable.contents.value).equal(expectations[variableName]);
      }
    });
  });

  describe("getScopes", () => {
    it("single scope", () => {
      const pauseData = {
        frame: {
          scope: {
            actor: "actor1"
          },
          this: {}
        }
      };

      const selectedFrame = {
        scope: {
          actor: "actor1",
          type: "block",
          bindings: {
            arguments: [],
            variables: {}
          },
          parent: null
        },
        this: {}
      };

      const scopes = getScopes(fromJS(pauseData), selectedFrame);
      expect(scopes[0].path).to.equal("actor1-1");
      expect(scopes[0].contents[0]).to.eql({
        name: "<this>",
        path: "actor1-1/<this>",
        contents: { value: {} }
      });
    });

    it("second scope", () => {
      const pauseData = {
        frame: {
          scope: {
            actor: "actor1"
          },
          this: {}
        }
      };

      const selectedFrame = {
        scope: {
          actor: "actor1",
          type: "block",
          bindings: {
            arguments: [],
            variables: {}
          },
          parent: {
            actor: "actor2",
            type: "block",
            bindings: {
              arguments: [],
              variables: {
                foo: {}
              }
            }
          }
        },
        this: {}
      };

      const scopes = getScopes(fromJS(pauseData), selectedFrame);
      expect(scopes[1].path).to.equal("actor2-2");
      expect(scopes[1].contents[0]).to.eql({
        name: "foo",
        path: "actor2-2/foo",
        contents: {}
      });
    });
  });
});
