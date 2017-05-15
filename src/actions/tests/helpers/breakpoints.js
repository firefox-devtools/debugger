import { makeLocationId } from "../../../reducers/breakpoints";

export const theMockedPendingBreakpoint = {
  location: {
    sourceUrl: "http://localhost:8000/examples/bar.js",
    line: 5,
    column: undefined
  },
  condition: "3",
  disabled: false
};

export function generateCorrectedBreakpoint(breakpoint, correctedLocation) {
  return Object.assign({}, breakpoint, { location: correctedLocation });
}

function generateCorrectingThreadClient(offset = 0) {
  return {
    setBreakpoint: (location, condition) => {
      return new Promise((resolve, reject) => {
        const actualLocation = Object.assign({}, location, {
          line: location.line + offset
        });
        resolve({ id: makeLocationId(location), actualLocation, condition });
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

export function generatePendingBreakpoint(breakpoint) {
  const {
    location: { sourceUrl, line, column },
    condition,
    disabled
  } = breakpoint;

  return {
    location: { sourceUrl, line, column },
    condition,
    disabled
  };
}

export const simpleMockThreadClient = {
  setBreakpoint: (location, _condition) => {
    return new Promise((resolve, reject) => {
      resolve({ id: "hi", actualLocation: location });
    });
  },

  removeBreakpoint: _id => {
    return new Promise((resolve, reject) => {
      resolve({ status: "done" });
    });
  },

  setBreakpointCondition: (_id, _location, _condition, _noSliding) => {
    return new Promise((resolve, reject) => {
      resolve({ sourceId: "a", line: 5 });
    });
  }
};
