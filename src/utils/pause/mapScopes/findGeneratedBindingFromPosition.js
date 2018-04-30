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
  bindingType: BindingType,
  generatedAstBindings: Array<GeneratedBindingLocation>
): Promise<GeneratedDescriptor | null> {
  const locationType = pos.type;

  const generatedRanges = await getGeneratedLocationRanges(
    source,
    pos,
    bindingType,
    locationType,
    sourceMaps
  );
  let applicableBindings = filterApplicableBindings(
    generatedAstBindings,
    generatedRanges
  );

  // We can adjust this number as we go, but these are a decent start as a
  // general heuristic to assume the bindings were bad or just map a chunk of
  // whole line or something.
  if (applicableBindings.length > 4) {
    // Babel's for..of generates at least 3 bindings inside one range for
    // block-scoped loop variables, so we shouldn't go below that.
    applicableBindings = [];
  }

  let result;
  if (bindingType === "import") {
    result = await findGeneratedImportReference(applicableBindings);

    if (!result && pos.type === "decl") {
      const importName = pos.importName;
      if (typeof importName !== "string") {
        // Should never happen, just keeping Flow happy.
        return null;
      }

      let applicableImportBindings = applicableBindings;
      if (generatedRanges.length === 0) {
        // If the imported name itself does not map to a useful range, fall back
        // to resolving the bindinding using the location of the overall
        // import declaration.
        const declarationRanges = await getGeneratedLocationRanges(
          source,
          pos.declaration,
          bindingType,
          locationType,
          sourceMaps
        );
        applicableImportBindings = filterApplicableBindings(
          generatedAstBindings,
          declarationRanges
        );

        if (applicableImportBindings.length > 10) {
          // Import declarations tend to have a large number of bindings for
          // for things like 'require' and 'interop', so this number is larger
          // than other binding count checks.
          applicableImportBindings = [];
        }
      }

      result = await findGeneratedImportDeclaration(
        applicableImportBindings,
        importName
      );
    }
  } else {
    result = await findGeneratedReference(applicableBindings);
  }

  return result;
}

type ApplicableBinding = {
  binding: GeneratedBindingLocation,
  range: GeneratedRange,
  firstInRange: boolean,
  firstOnLine: boolean
};

function filterApplicableBindings(
  bindings: Array<GeneratedBindingLocation>,
  ranges: Array<GeneratedRange>
): Array<ApplicableBinding> {
  const result = [];
  for (const range of ranges) {
    // Any binding overlapping a part of the mapping range.
    const filteredBindings = filterSortedArray(bindings, binding => {
      if (positionCmp(binding.loc.end, range.start) <= 0) {
        return -1;
      }
      if (positionCmp(binding.loc.start, range.end) >= 0) {
        return 1;
      }

      return 0;
    });

    let firstInRange = true;
    let firstOnLine = true;
    let line = -1;

    for (const binding of filteredBindings) {
      if (binding.loc.start.line === line) {
        firstOnLine = false;
      } else {
        line = binding.loc.start.line;
        firstOnLine = true;
      }

      result.push({
        binding,
        range,
        firstOnLine,
        firstInRange
      });

      firstInRange = false;
    }
  }

  return result;
}

/**
 * Given a mapped range over the generated source, attempt to resolve a real
 * binding descriptor that can be used to access the value.
 */
async function findGeneratedReference(
  applicableBindings: Array<ApplicableBinding>
): Promise<GeneratedDescriptor | null> {
  for (const applicable of applicableBindings) {
    const result = await mapBindingReferenceToDescriptor(applicable);
    if (result) {
      return result;
    }
  }
  return null;
}

async function findGeneratedImportReference(
  applicableBindings: Array<ApplicableBinding>
): Promise<GeneratedDescriptor | null> {
  // When wrapped, for instance as `Object(ns.default)`, the `Object` binding
  // will be the first in the list. To avoid resolving `Object` as the
  // value of the import itself, we potentially skip the first binding.
  applicableBindings = applicableBindings.filter((applicable, i) => {
    if (
      !applicable.firstInRange ||
      applicable.binding.loc.type !== "ref" ||
      applicable.binding.loc.meta
    ) {
      return true;
    }

    const next =
      i + 1 < applicableBindings.length ? applicableBindings[i + 1] : null;

    return !next || next.binding.loc.type !== "ref" || !next.binding.loc.meta;
  });

  for (const applicable of applicableBindings) {
    const result = await mapImportReferenceToDescriptor(applicable);
    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Given a mapped range over the generated source and the name of the imported
 * value that is referenced, attempt to resolve a binding descriptor for
 * the import's value.
 */
async function findGeneratedImportDeclaration(
  applicableBindings: Array<ApplicableBinding>,
  importName: string
): Promise<GeneratedDescriptor | null> {
  let result = null;

  for (const { binding } of applicableBindings) {
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

    const desc = await readDescriptorProperty(namespaceDesc, importName);
    const expression = `${binding.name}.${importName}`;

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
async function mapBindingReferenceToDescriptor({
  binding,
  range,
  firstInRange,
  firstOnLine
}: ApplicableBinding): Promise<GeneratedDescriptor | null> {
  // Allow the mapping to point anywhere within the generated binding
  // location to allow for less than perfect sourcemaps. Since you also
  // need at least one character between identifiers, we also give one
  // characters of space at the front the generated binding in order
  // to increase the probability of finding the right mapping.
  if (
    range.start.line === binding.loc.start.line &&
    // If a binding is the first on a line, Babel will extend the mapping to
    // include the whitespace between the newline and the binding. To handle
    // that, we skip the range requirement for starting location.
    (firstInRange ||
      firstOnLine ||
      locColumn(range.start) >= locColumn(binding.loc.start)) &&
    locColumn(range.start) <= locColumn(binding.loc.end)
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
async function mapImportReferenceToDescriptor({
  binding,
  range
}: ApplicableBinding): Promise<GeneratedDescriptor | null> {
  if (binding.loc.type !== "ref") {
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

  if (!mappingContains(range, binding.loc)) {
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
      op && mappingContains(range, op) && desc && index < 2;
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

type GeneratedRange = {
  start: Position,
  end: Position
};

async function getGeneratedLocationRanges(
  source: Source,
  {
    start,
    end
  }: {
    start: Location,
    end: Location
  },
  bindingType: BindingType,
  locationType: BindingLocationType,
  sourceMaps: any
): Promise<Array<GeneratedRange>> {
  const endPosition = await sourceMaps.getGeneratedLocation(end, source);
  const startPosition = await sourceMaps.getGeneratedLocation(start, source);

  // If the start and end positions collapse into eachother, it means that
  // the range in the original content didn't _start_ at the start position.
  // Since this likely means that the range doesn't logically apply to this
  // binding location, we skip it.
  if (positionCmp(startPosition, endPosition) === 0) {
    return [];
  }

  const ranges = await sourceMaps.getGeneratedRanges(start, source);

  const resultRanges = ranges.reduce((acc, mapRange) => {
    // Some tooling creates ranges that map a line as a whole, which is useful
    // for step-debugging, but can easily lead to finding the wrong binding.
    // To avoid these false-positives, we entirely ignore ranges that cover
    // full lines.
    if (
      locationType === "ref" &&
      mapRange.columnStart === 0 &&
      mapRange.columnEnd === Infinity
    ) {
      return acc;
    }

    const range = {
      start: {
        line: mapRange.line,
        column: mapRange.columnStart
      },
      end: {
        line: mapRange.line,
        // SourceMapConsumer's 'lastColumn' is inclusive, so we add 1 to make
        // it exclusive like all other locations.
        column: mapRange.columnEnd + 1
      }
    };

    const previous = acc[acc.length - 1];

    if (
      previous &&
      ((previous.end.line === range.start.line &&
        previous.end.column === range.start.column) ||
        (previous.end.line + 1 === range.start.line &&
          previous.end.column === Infinity &&
          range.start.column === 0))
    ) {
      previous.end.line = range.end.line;
      previous.end.column = range.end.column;
    } else {
      acc.push(range);
    }

    return acc;
  }, []);

  // When searching for imports, we expand the range to up to the next available
  // mapping to allow for import declarations that are composed of multiple
  // variable statements, where the later ones are entirely unmapped.
  // Babel 6 produces imports in this style, e.g.
  //
  // var _mod = require("mod"); // mapped from import statement
  // var _mod2 = interop(_mod); // entirely unmapped
  if (bindingType === "import" && locationType === "decl") {
    for (const range of resultRanges) {
      if (
        mappingContains(range, { start: startPosition, end: startPosition }) &&
        positionCmp(range.end, endPosition) < 0
      ) {
        range.end.line = endPosition.line;
        range.end.column = endPosition.column;
        break;
      }
    }
  }

  return resultRanges;
}
