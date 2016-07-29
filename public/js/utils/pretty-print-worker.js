const prettyFast = require("pretty-fast");

self.onmessage = function(msg) {
  let { code, mappings } = prettyPrint(msg.data);
  mappings = invertMappings(mappings);
  self.postMessage({ code, mappings });
};

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
    return new Error(e.message + "\n" + e.stack);
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
