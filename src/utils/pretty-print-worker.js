const prettyFast = require("pretty-fast");
const assert = require("./assert");

function prettyPrint({ url, indent, source }) {
  try {
    const prettified = prettyFast(source, {
      url: url,
      indent: " ".repeat(indent)
    });

    return {
      code: prettified.code,
      mappings: prettified.map._mappings
    };
  } catch (e) {
    return new Error(`${e.message}\n${e.stack}`);
  }
}

function invertMappings(mappings) {
  return mappings._array.map(m => {
    let mapping = {
      generated: {
        line: m.originalLine,
        column: m.originalColumn
      }
    };
    if (m.source) {
      mapping.source = m.source;
      mapping.original = {
        line: m.generatedLine,
        column: m.generatedColumn
      };
      mapping.name = m.name;
    }
    return mapping;
  });
}

self.onmessage = function(msg) {
  const { id, args } = msg.data;
  assert(msg.data.method === "prettyPrint",
        "Method must be `prettyPrint`");

  try {
    let { code, mappings } = prettyPrint(args[0]);
    self.postMessage({ id, response: {
      code, mappings: invertMappings(mappings)
    }});
  } catch (e) {
    self.postMessage({ id, error: e });
  }
};
