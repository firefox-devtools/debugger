/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type {
  BindingLocation,
  BindingLocationType,
  BindingType
} from "../../../workers/parser";
import { locColumn } from "./locColumn";
import { filterSortedArray } from "./filtering";

import type {
  Source,
  Location,
  Position,
  BindingContents
} from "../../../types";
// eslint-disable-next-line max-len
import type { GeneratedBindingLocation } from "../../../actions/pause/mapScopes";

import { createObjectClient } from "../../../client/firefox";

type GeneratedDescriptor = {
  name: string,
  // Falsy if the binding itself matched a location, but the location didn't
  // have a value descriptor attached. Happens if the binding was 'this'
  // or if there was a mismatch between client and generated scopes.
  desc: ?BindingContents,

  expression: string
};

export async function findGeneratedBindingFromPosition(
  sourceMaps: any,
  client: any,
  source: Source,
  pos: BindingLocation,
  name: string,
  type: BindingType,
  generatedAstBindings: Array<GeneratedBindingLocation>
): Promise<GeneratedDescriptor | null> {
  const range = await getGeneratedLocationRange(pos, source, type, sourceMaps);

  if (range) {
    let result;
    if (type === "import") {
      result = await findGeneratedImportReference(type, generatedAstBindings, {
        type: pos.type,
        ...range
      });
    } else {
      result = await findGeneratedReference(type, generatedAstBindings, {
        type: pos.type,
        ...range
      });
    }

    if (result) {
      return result;
    }
  }

  if (type === "import" && pos.type === "decl") {
    let importRange = range;
    if (!importRange) {
      // If the imported name itself does not map to a useful range, fall back
      // to resolving the bindinding using the location of the overall
      // import declaration.
      importRange = await getGeneratedLocationRange(
        {
          type: pos.type,
          start: pos.declaration.start,
          end: pos.declaration.end
        },
        source,
        type,
        sourceMaps
      );

      if (!importRange) {
        return null;
      }
    }

    const importName = pos.importName;
    if (typeof importName !== "string") {
      // Should never happen, just keeping Flow happy.
      return null;
    }

    return await findGeneratedImportDeclaration(generatedAstBindings, {
      importName,
      ...importRange
    });
  }

  return null;
}

function filterApplicableBindings(
  bindings: Array<GeneratedBindingLocation>,
  mapped: {
    start: Position,
    end: Position
  }
): Array<GeneratedBindingLocation> {
  // Any binding overlapping a part of the mapping range.
  return filterSortedArray(bindings, binding => {
    if (positionCmp(binding.loc.end, mapped.start) <= 0) {
      return -1;
    }
    if (positionCmp(binding.loc.start, mapped.end) >= 0) {
      return 1;
    }

    return 0;
  });
}

/**
 * Given a mapped range over the generated source, attempt to resolve a real
 * binding descriptor that can be used to access the value.
 */
async function findGeneratedReference(
  type: BindingType,
  generatedAstBindings: Array<GeneratedBindingLocation>,
  mapped: {
    type: BindingLocationType,
    start: Position,
    end: Position
  }
): Promise<GeneratedDescriptor | null> {
  const bindings = filterApplicableBindings(generatedAstBindings, mapped);

  let lineStart = true;
  let line = -1;

  return bindings.reduce(async (acc, val, i) => {
    const accVal = await acc;
    if (accVal) {
      return accVal;
    }

    if (val.loc.start.line === line) {
      lineStart = false;
    } else {
      line = val.loc.start.line;
      lineStart = true;
    }

    return mapBindingReferenceToDescriptor(val, mapped, lineStart);
  }, null);
}

async function findGeneratedImportReference(
  type: BindingType,
  generatedAstBindings: Array<GeneratedBindingLocation>,
  mapped: {
    type: BindingLocationType,
    start: Position,
    end: Position
  }
): Promise<GeneratedDescriptor | null> {
  let bindings = filterApplicableBindings(generatedAstBindings, mapped);

  // When wrapped, for instance as `Object(ns.default)`, the `Object` binding
  // will be the first in the list. To avoid resolving `Object` as the
  // value of the import itself, we potentially skip the first binding.
  if (bindings.length > 1 && !bindings[0].loc.meta && bindings[1].loc.meta) {
    bindings = bindings.slice(1);
  }

  return bindings.reduce(async (acc, val) => {
    const accVal = await acc;
    if (accVal) {
      return accVal;
    }

    return mapImportReferenceToDescriptor(val, mapped);
  }, null);
}

/**
 * Given a mapped range over the generated source and the name of the imported
 * value that is referenced, attempt to resolve a binding descriptor for
 * the import's value.
 */
async function findGeneratedImportDeclaration(
  generatedAstBindings: Array<GeneratedBindingLocation>,
  mapped: {
    start: Position,
    end: Position,
    importName: string
  }
): Promise<GeneratedDescriptor | null> {
  const bindings = filterApplicableBindings(generatedAstBindings, mapped);

  let result = null;

  for (const binding of bindings) {
    if (binding.loc.type !== "decl") {
      continue;
    }

    const namespaceDesc = await binding.desc();
    if (isPrimitiveValue(namespaceDesc)) {
      continue;
    }
    if (!isObjectValue(namespaceDesc)) {
      // We want to handle cases like
      //
      //   var _mod = require(...);
      //   var _mod2 = _interopRequire(_mod);
      //
      // where "_mod" is optimized out because it is only referenced once. To
      // allow that, we track the optimized-out value as a possible result,
      // but allow later binding values to overwrite the result.
      result = {
        name: binding.name,
        desc: namespaceDesc,
        expression: binding.name
      };
      continue;
    }

    const desc = await readDescriptorProperty(namespaceDesc, mapped.importName);
    const expression = `${binding.name}.${mapped.importName}`;

    if (desc) {
      result = {
        name: binding.name,
        desc,
        expression
      };
      break;
    }
  }

  return result;
}

/**
 * Given a generated binding, and a range over the generated code, statically
 * check if the given binding matches the range.
 */
async function mapBindingReferenceToDescriptor(
  binding: GeneratedBindingLocation,
  mapped: {
    type: BindingLocationType,
    start: Position,
    end: Position
  },
  isFirst: boolean
): Promise<GeneratedDescriptor | null> {
  // Allow the mapping to point anywhere within the generated binding
  // location to allow for less than perfect sourcemaps. Since you also
  // need at least one character between identifiers, we also give one
  // characters of space at the front the generated binding in order
  // to increase the probability of finding the right mapping.
  if (
    mapped.start.line === binding.loc.start.line &&
    // If a binding is the first on a line, Babel will extend the mapping to
    // include the whitespace between the newline and the binding. To handle
    // that, we skip the range requirement for starting location.
    (isFirst || locColumn(mapped.start) >= locColumn(binding.loc.start)) &&
    locColumn(mapped.start) <= locColumn(binding.loc.end)
  ) {
    return {
      name: binding.name,
      desc: await binding.desc(),
      expression: binding.name
    };
  }

  return null;
}

/**
 * Given an generated binding, and a range over the generated code, statically
 * evaluate accessed properties within the mapped range to resolve the actual
 * imported value.
 */
async function mapImportReferenceToDescriptor(
  binding: GeneratedBindingLocation,
  mapped: {
    type: BindingLocationType,
    start: Position,
    end: Position
  }
): Promise<GeneratedDescriptor | null> {
  if (mapped.type !== "ref") {
    return null;
  }

  // Expression matches require broader searching because sourcemaps usage
  // varies in how they map certain things. For instance given
  //
  //   import { bar } from "mod";
  //   bar();
  //
  // The "bar()" expression is generally expanded into one of two possibly
  // forms, both of which map the "bar" identifier in different ways. See
  // the "^^" markers below for the ranges.
  //
  //   (0, foo.bar)()    // Babel
  //       ^^^^^^^       // mapping
  //       ^^^           // binding
  // vs
  //
  //   Object(foo.bar)() // Webpack
  //   ^^^^^^^^^^^^^^^   // mapping
  //          ^^^        // binding
  //
  // Unfortunately, Webpack also has a tendancy to over-map past the call
  // expression to the start of the next line, at least when there isn't
  // anything else on that line that is mapped, e.g.
  //
  //   Object(foo.bar)()
  //   ^^^^^^^^^^^^^^^^^
  //   ^                 // wrapped to column 0 of next line

  if (!mappingContains(mapped, binding.loc)) {
    return null;
  }

  let expression = binding.name;
  let desc = await binding.desc();

  if (binding.loc.type === "ref") {
    const { meta } = binding.loc;

    // Limit to 2 simple property or inherits operartions, since it would
    // just be more work to search more and it is very unlikely that
    // bindings would be mapped to more than a single member + inherits
    // wrapper.
    for (
      let op = meta, index = 0;
      op && mappingContains(mapped, op) && desc && index < 2;
      index++, op = op && op.parent
    ) {
      // Calling could potentially trigger side-effects, which would not
      // be ideal for this case.
      if (op.type === "call") {
        return null;
      }

      if (op.type === "inherit") {
        continue;
      }

      desc = await readDescriptorProperty(desc, op.property);
      expression += `.${op.property}`;
    }
  }

  return desc
    ? {
        name: binding.name,
        desc,
        expression
      }
    : null;
}

function isPrimitiveValue(desc: ?BindingContents) {
  return desc && (!desc.value || typeof desc.value !== "object");
}
function isObjectValue(desc: ?BindingContents) {
  return (
    desc &&
    !isPrimitiveValue(desc) &&
    desc.value.type === "object" &&
    // Note: The check for `.type` might already cover the optimizedOut case
    // but not 100% sure, so just being cautious.
    !desc.value.optimizedOut
  );
}

async function readDescriptorProperty(
  desc: ?BindingContents,
  property: string
): Promise<?BindingContents> {
  if (!desc) {
    return null;
  }

  if (typeof desc.value !== "object" || !desc.value) {
    // If accessing a property on a primitive type, just return 'undefined'
    // as the value.
    return {
      value: {
        type: "undefined"
      }
    };
  }

  if (!isObjectValue(desc)) {
    // If we got a non-primitive descriptor but it isn't an object, then
    // it's definitely not the namespace and it is probably an error.
    return desc;
  }

  const objectClient = createObjectClient(desc.value);
  return (await objectClient.getProperty(property)).descriptor;
}

function mappingContains(mapped, item) {
  return (
    positionCmp(item.start, mapped.start) >= 0 &&
    positionCmp(item.end, mapped.end) <= 0
  );
}

/**
 * * === 0 - Positions are equal.
 * * < 0 - first position before second position
 * * > 0 - first position after second position
 */
function positionCmp(p1: Position, p2: Position) {
  if (p1.line === p2.line) {
    const l1 = locColumn(p1);
    const l2 = locColumn(p2);

    if (l1 === l2) {
      return 0;
    }
    return l1 < l2 ? -1 : 1;
  }

  return p1.line < p2.line ? -1 : 1;
}

async function getGeneratedLocationRange(
  pos: {
    +type: BindingLocationType,
    start: Location,
    end: Location
  },
  source: Source,
  type: BindingType,
  sourceMaps: any
): Promise<{
  start: Position,
  end: Position
} | null> {
  const endPosition = await sourceMaps.getGeneratedLocation(pos.end, source);
  const startPosition = await sourceMaps.getGeneratedLocation(
    pos.start,
    source
  );
  const ranges = await sourceMaps.getGeneratedRanges(pos.start, source);
  if (ranges.length === 0) {
    return null;
  }

  // If the start and end positions collapse into eachother, it means that
  // the range in the original content didn't _start_ at the start position.
  // Since this likely means that the range doesn't logically apply to this
  // binding location, we skip it.
  if (positionCmp(startPosition, endPosition) === 0) {
    return null;
  }

  const start = {
    line: ranges[0].line,
    column: ranges[0].columnStart
  };
  const end = {
    line: ranges[0].line,
    // SourceMapConsumer's 'lastColumn' is inclusive, so we add 1 to make
    // it exclusive like all other locations.
    column: ranges[0].columnEnd + 1
  };

  // Expand the range over any following ranges if they are contiguous.
  for (let i = 1; i < ranges.length; i++) {
    const range = ranges[i];
    if (
      end.column !== Infinity ||
      range.line !== end.line + 1 ||
      range.columnStart !== 0
    ) {
      break;
    }
    end.line = range.line;
    end.column = range.columnEnd + 1;
  }

  // When searching for imports, we expand the range to up to the next available
  // mapping to allow for import declarations that are composed of multiple
  // variable statements, where the later ones are entirely unmapped.
  // Babel 6 produces imports in this style, e.g.
  //
  // var _mod = require("mod"); // mapped from import statement
  // var _mod2 = interop(_mod); // entirely unmapped
  if (type === "import" && pos.type === "decl" && endPosition.line > end.line) {
    end.line = endPosition.line;
    end.column = endPosition.column;
  }

  return { start, end };
}
