export function mockPendingBreakpoint(overrides = {}) {
  const { sourceUrl, line, column, condition, disabled, hidden } = overrides;
  return {
    location: {
      sourceUrl: sourceUrl || "http://localhost:8000/examples/bar.js",
      line: line || 5,
      column: column || undefined
    },
    generatedLocation: {
      sourceUrl: sourceUrl || "http://localhost:8000/examples/bar.js",
      line: line || 5,
      column: column || undefined
    },
    astLocation: {
      name: undefined,
      offset: {
        line: line || 5
      }
    },
    condition: condition || null,
    disabled: disabled || false,
    hidden: hidden || false
  };
}

export function generateBreakpoint(filename) {
  return {
    location: {
      sourceUrl: `http://localhost:8000/examples/${filename}`,
      sourceId: filename,
      line: 5
    },
    condition: null,
    disabled: false,
    hidden: false
  };
}
