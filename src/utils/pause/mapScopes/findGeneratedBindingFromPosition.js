// @flow

import { isEqual } from "lodash";
import type {
  BindingLocation,
  BindingLocationType,
  BindingType
} from "../../../workers/parser";
import { locColumn } from "./locColumn";

import type { Source, Location, BindingContents } from "../../../types";
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
  const range = await getGeneratedLocationRange(pos, source, sourceMaps);

  if (range) {
    const result = await findGeneratedReference(type, generatedAstBindings, {
      type: pos.type,
      ...range
    });

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
        pos.declaration,
        source,
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

/**
 * Given a mapped range over the generated source, attempt to resolve a real
 * binding descriptor that can be used to access the value.
 */
async function findGeneratedReference(
  type: BindingType,
  generatedAstBindings: Array<GeneratedBindingLocation>,
  mapped: {
    type: BindingLocationType,
    start: Location,
    end: Location
  }
): Promise<GeneratedDescriptor | null> {
  return generatedAstBindings.reduce(async (acc, val) => {
    const accVal = await acc;
    if (accVal) {
      return accVal;
    }

    return type === "import"
      ? await mapImportReferenceToDescriptor(val, mapped)
      : await mapBindingReferenceToDescriptor(val, mapped);
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
    start: Location,
    end: Location,
    importName: string
  }
): Promise<GeneratedDescriptor | null> {
  return generatedAstBindings.reduce(async (acc, val) => {
    const accVal = await acc;
    if (accVal) {
      return accVal;
    }

    return await mapImportDeclarationToDescriptor(val, mapped);
  }, null);
}

/**
 * Given a generated binding, and a range over the generated code, statically
 * check if the given binding matches the range.
 */
async function mapBindingReferenceToDescriptor(
  binding: GeneratedBindingLocation,
  mapped: {
    type: BindingLocationType,
    start: Location,
    end: Location
  }
): Promise<GeneratedDescriptor | null> {
  // Allow the mapping to point anywhere within the generated binding
  // location to allow for less than perfect sourcemaps. Since you also
  // need at least one character between identifiers, we also give one
  // characters of space at the front the generated binding in order
  // to increase the probability of finding the right mapping.
  if (
    mapped.start.line === binding.loc.start.line &&
    locColumn(mapped.start) >= locColumn(binding.loc.start) - 1 &&
    locColumn(mapped.start) <= locColumn(binding.loc.end)
  ) {
    return {
      name: binding.name,
      desc: binding.desc,
      expression: binding.name
    };
  }

  return null;
}

/**
 * Given an generated binding, and a range over the generated code, statically
 * resolve the module namespace object and attempt to access the imported
 * property on the namespace.
 *
 * This is mostly hard-coded to work for Babel 6's imports.
 */
async function mapImportDeclarationToDescriptor(
  binding: GeneratedBindingLocation,
  mapped: {
    start: Location,
    end: Location,
    importName: string
  }
): Promise<GeneratedDescriptor | null> {
  // When trying to map an actual import declaration binding, we can try
  // to map it back to the namespace object in the original code.
  if (!mappingContains(mapped, binding.loc)) {
    return null;
  }

  let expression = binding.name;

  let desc = binding.desc;
  if (desc && typeof desc.value === "object") {
    if (desc.value.optimizedOut) {
      // If the value was optimized out, we skip it entirely because there is
      // a good chance that this means that this isn't the right binding. This
      // allows us to catch cases like
      //
      //   var _mod = require(...);
      //   var _mod2 = _interopRequire(_mod);
      //
      // where "_mod" is optimized out because it is only referenced once, and
      // we want to continue searching to try to find "_mod2".
      return null;
    }

    if (desc.value.type !== "object") {
      // If we got a non-primitive descriptor but it isn't an object, then
      // it's definitely not the namespace.
      return null;
    }

    const objectClient = createObjectClient(desc.value);
    desc = (await objectClient.getProperty(mapped.importName)).descriptor;

    expression += `.${mapped.importName}`;
  }

  return desc
    ? {
        name: binding.name,
        desc,
        expression
      }
    : null;
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
    start: Location,
    end: Location
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
  let desc = binding.desc;

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

      const objectClient = createObjectClient(desc.value);
      desc = (await objectClient.getProperty(op.property)).descriptor;

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

function mappingContains(mapped, item) {
  return (
    (item.start.line > mapped.start.line ||
      (item.start.line === mapped.start.line &&
        locColumn(item.start) >= locColumn(mapped.start))) &&
    (item.end.line < mapped.end.line ||
      (item.end.line === mapped.end.line &&
        locColumn(item.end) <= locColumn(mapped.end)))
  );
}

async function getGeneratedLocationRange(
  pos: { start: Location, end: Location },
  source: Source,
  sourceMaps: any
): Promise<{
  start: Location,
  end: Location
} | null> {
  const start = await sourceMaps.getGeneratedLocation(pos.start, source);
  const end = await sourceMaps.getGeneratedLocation(pos.end, source);

  // Since the map takes the closest location, sometimes mapping a
  // binding's location can point at the start of a binding listed after
  // it, so we need to make sure it maps to a location that actually has
  // a size in order to avoid picking up the wrong descriptor.
  if (isEqual(start, end)) {
    return null;
  }

  return { start, end };
}
