import { makeLocationId } from "../../../utils/breakpoint";

export function mockPendingBreakpoint(overrides = {}) {
  const { sourceUrl, line, column, condition, disabled } = overrides;
  return {
    location: {
      sourceUrl: sourceUrl || "http://localhost:8000/examples/bar.js",
      line: line || 5,
      column: column || undefined
    },
    generatedLocation: {
      sourceUrl: sourceUrl || "http://localhost:8000/examples/bar.js",
      sourceId: "server1.conn76.child1/30",
      line: line || 5,
      column: column || undefined
    },
    condition: condition || null,
    disabled: disabled || false
  };
}

function generateCorrectingThreadClient(offset = 0) {
  return {
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

export function generateBreakpoint(filename) {
  return {
    location: {
      sourceUrl: `http://localhost:8000/examples/${filename}`,
      sourceId: filename,
      line: 5
    },
    condition: null,
    disabled: false
  };
}

export const simpleMockThreadClient = {
  setBreakpoint: (location, _condition) =>
    Promise.resolve({ id: "hi", actualLocation: location }),

  removeBreakpoint: _id => Promise.resolve({ status: "done" }),

  setBreakpointCondition: (_id, _location, _condition, _noSliding) =>
    Promise.resolve({ sourceId: "a", line: 5 })
};
