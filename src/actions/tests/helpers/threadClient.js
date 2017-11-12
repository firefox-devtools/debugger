import { makeLocationId } from "../../../utils/breakpoint";

function createSource(name) {
  return {
    source: `function ${name}() {\n  return ${name} \n}`,
    contentType: "text/javascript"
  };
}

const sources = [
  "a",
  "b",
  "foo",
  "baz.js",
  "bar",
  "foo1",
  "foo2",
  "foobar.js",
  "barfoo.js",
  "foo.js",
  "bar.js",
  "base.js",
  "bazz.js",
  "jquery.js"
];

export const simpleMockThreadClient = {
  getBreakpointByLocation: jest.fn(),
  setBreakpoint: (location, _condition) =>
    Promise.resolve({ id: "hi", actualLocation: location }),

  removeBreakpoint: _id => Promise.resolve(),

  setBreakpointCondition: (_id, _location, _condition, _noSliding) =>
    Promise.resolve({ sourceId: "a", line: 5 }),

  sourceContents: sourceId =>
    new Promise((resolve, reject) => {
      if (sources.includes(sourceId)) {
        resolve(createSource(sourceId));
      }

      reject(`unknown source: ${sourceId}`);
    })
};

// Breakpoint Sliding
function generateCorrectingThreadClient(offset = 0) {
  return {
    getBreakpointByLocation: jest.fn(),
    setBreakpoint: (location, condition) => {
      const actualLocation = { ...location, line: location.line + offset };

      return Promise.resolve({
        id: makeLocationId(location),
        actualLocation,
        condition
      });
    },
    sourceContents: sourceId => Promise.resolve(createSource(sourceId))
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
  const correctedLocation = { ...location, ...offsetLine };
  return { correctedThreadClient, correctedLocation };
}

// sources and tabs
export const sourceThreadClient = {
  sourceContents: function(sourceId) {
    return new Promise((resolve, reject) => {
      if (sources.includes(sourceId)) {
        resolve(createSource(sourceId));
      }

      reject(`unknown source: ${sourceId}`);
    });
  }
};
