import { makeLocationId } from "../../../utils/breakpoint";

const sourceFixtures = {
  foo1: {
    source: "function foo1() {\n  return 5;\n}",
    contentType: "text/javascript"
  },
  foo2: {
    source: "function foo2(x, y) {\n  return x + y;\n}",
    contentType: "text/javascript"
  }
};

export const simpleMockThreadClient = {
  getBreakpointByLocation: jest.fn(),
  setBreakpoint: (location, _condition) =>
    Promise.resolve({ id: "hi", actualLocation: location }),

  removeBreakpoint: _id => Promise.resolve(),

  setBreakpointCondition: (_id, _location, _condition, _noSliding) =>
    Promise.resolve({ sourceId: "a", line: 5 }),

  sourceContents: sourceId =>
    new Promise((resolve, reject) => {
      if (sourceFixtures[sourceId]) {
        resolve(sourceFixtures[sourceId]);
      }

      reject(`unknown source: ${sourceId}`);
    })
};

// Breakpoint Sliding
function generateCorrectingThreadClient(offset = 0) {
  return {
    getBreakpointByLocation: jest.fn(),
    setBreakpoint: (location, condition) => {
      const actualLocation = Object.assign({}, location, {
        line: location.line + offset
      });

      return Promise.resolve({
        id: makeLocationId(location),
        actualLocation,
        condition
      });
    }
  };
}

/* in some cases, a breakpoint may be added, but the source will respond
 * with a different breakpoint location. This is due to the breakpoint being
 * added between functions, or somewhere that doesnt make sense. This function
 * simulates that behavior.
 * */
export function simulateCorrectThreadClient(offset, location) {
  const correctedThreadClient = generateCorrectingThreadClient(offset);
  const offsetLine = { line: location.line + offset };
  const correctedLocation = Object.assign({}, location, offsetLine);
  return { correctedThreadClient, correctedLocation };
}

// sources and tabs
export const sourceThreadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      switch (sourceId) {
        case "foo1":
          resolve({
            source: "function foo1() {\n  return 5;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foo2":
          resolve({
            source: "function foo2(x, y) {\n  return x + y;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foobar.js":
          resolve({
            source: "function foo() {\n  return 2;\n}",
            contentType: "text/javascript"
          });
          break;
        case "barfoo.js":
          resolve({
            source: "function bar() {\n  return 3;\n}",
            contentType: "text/javascript"
          });
          break;
        case "foo.js":
          resolve({
            source: "function bar() {\n  return 3;\n}",
            contentType: "text/javascript"
          });
          break;
        case "bar.js":
          resolve({
            source: "function bar() {\n  return 3;\n}",
            contentType: "text/javascript"
          });
          break;
        case "base.js":
          resolve({
            source: "function base() {\n  return 3;\n}",
            contentType: "text/javascript"
          });
          break;

        case "bazz.js":
          resolve({
            source: "function bar() {\n  return 3;\n}",
            contentType: "text/javascript"
          });
          break;
      }

      reject(`unknown source: ${sourceId}`);
    });
  }
};
