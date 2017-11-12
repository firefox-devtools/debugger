import { getFramePopVariables, getScopes } from "../scopes";

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
  describe("getFramePopVariables", () => {
    describe("falsey values", () => {
      // NOTE: null and undefined are treated like objects and given a type
      const falsey = { false: false, "0": 0, null: { type: "null" } };
      for (const test in falsey) {
        const value = falsey[test];
        it(`shows ${test} returns`, () => {
          const pauseData = returnWhy(value);
          const vars = getFramePopVariables(pauseData, "");
          expect(vars[0].name).toEqual("<return>");
          expect(vars[0].name).toEqual("<return>");
          expect(vars[0].contents.value).toEqual(value);
        });

        it(`shows ${test} throws`, () => {
          const pauseData = throwWhy(value);
          const vars = getFramePopVariables(pauseData, "");
          expect(vars[0].name).toEqual("<exception>");
          expect(vars[0].name).toEqual("<exception>");
          expect(vars[0].contents.value).toEqual(value);
        });
      }
    });

    describe("Error / Objects", () => {
      it("shows Error returns", () => {
        const pauseData = returnWhy(errorGrip);
        const vars = getFramePopVariables(pauseData, "");
        expect(vars[0].name).toEqual("<return>");
        expect(vars[0].name).toEqual("<return>");
        expect(vars[0].contents.value.class).toEqual("Error");
      });

      it("shows error throws", () => {
        const pauseData = throwWhy(errorGrip);
        const vars = getFramePopVariables(pauseData, "");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].contents.value.class).toEqual("Error");
      });
    });

    describe("undefined", () => {
      it("does not show undefined returns", () => {
        const pauseData = returnWhy({ type: "undefined" });
        const vars = getFramePopVariables(pauseData, "");
        expect(vars.length).toEqual(0);
      });

      it("shows undefined throws", () => {
        const pauseData = throwWhy({ type: "undefined" });
        const vars = getFramePopVariables(pauseData, "");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].name).toEqual("<exception>");
        expect(vars[0].contents.value).toEqual({ type: "undefined" });
      });
    });
  });

  describe("getScopes", () => {
    it("single scope", () => {
      const pauseData = {
        frame: {
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

      const scopes = getScopes(pauseData, selectedFrame);
      expect(scopes[0].path).toEqual("actor1-1");
      expect(scopes[0].contents[0]).toEqual({
        name: "<this>",
        path: "actor1-1/<this>",
        contents: { value: {} }
      });
    });

    it("second scope", () => {
      const pauseData = {
        frame: {
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

      const scopes = getScopes(pauseData, selectedFrame);
      expect(scopes[1].path).toEqual("actor2-2");
      expect(scopes[1].contents[0]).toEqual({
        name: "foo",
        path: "actor2-2/foo",
        contents: {}
      });
    });

    it("returning scope", () => {
      const pauseData = {
        frame: {
          this: {}
        },
        why: {
          frameFinished: {
            return: "to sender"
          }
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

      const scopes = getScopes(pauseData, selectedFrame);
      expect(scopes).toMatchObject([
        {
          path: "actor1-1",
          contents: [
            {
              name: "<return>",
              path: "actor1-1/<return>",
              contents: {
                value: "to sender"
              }
            },
            {
              name: "<this>",
              path: "actor1-1/<this>",
              contents: {
                value: {}
              }
            }
          ]
        }
      ]);
    });

    it("throwing scope", () => {
      const pauseData = {
        frame: {
          this: {}
        },
        why: {
          frameFinished: {
            throw: "a party"
          }
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

      const scopes = getScopes(pauseData, selectedFrame);
      expect(scopes).toMatchObject([
        {
          path: "actor1-1",
          contents: [
            {
              name: "<exception>",
              path: "actor1-1/<exception>",
              contents: {
                value: "a party"
              }
            },
            {
              name: "<this>",
              path: "actor1-1/<this>",
              contents: {
                value: {}
              }
            }
          ]
        }
      ]);
    });
  });
});
