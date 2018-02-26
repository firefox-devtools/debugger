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

export async function findGeneratedBindingFromPosition(
  sourceMaps: any,
  client: any,
  source: Source,
  pos: BindingLocation,
  name: string,
  type: BindingType,
  generatedAstBindings: Array<GeneratedBindingLocation>
) {
  let gen = await sourceMaps.getGeneratedLocation(pos.start, source);
  let genEnd = await sourceMaps.getGeneratedLocation(pos.end, source);

  // Since the map takes the closest location, sometimes mapping a
  // binding's location can point at the start of a binding listed after
  // it, so we need to make sure it maps to a location that actually has
  // a size in order to avoid picking up the wrong descriptor.
  if (!isEqual(gen, genEnd)) {
    const result = generatedAstBindings.reduce(async (acc, val) => {
      const accVal = await acc;
      if (accVal) {
        return accVal;
      }

      if (type === "import") {
        name;
        type;

        const desc = await mapImportReferenceToDescriptor(val, {
          type: pos.type,
          start: gen,
          end: genEnd
        });
        return desc
          ? {
              name: val.name,
              desc: desc
            }
          : null;
      }

      // Allow the mapping to point anywhere within the generated binding
      // location to allow for less than perfect sourcemaps. Since you also
      // need at least one character between identifiers, we also give one
      // characters of space at the front the generated binding in order
      // to increase the probability of finding the right mapping.
      if (
        gen.line === val.loc.start.line &&
        locColumn(gen) >= locColumn(val.loc.start) - 1 &&
        locColumn(gen) <= locColumn(val.loc.end)
      ) {
        return {
          name: val.name,
          desc: val.desc
        };
      }

      return null;
    }, null);

    if (result) {
      return result;
    }
  }

  if (type !== "import" || pos.type !== "decl") {
    return null;
  }

  if (isEqual(gen, genEnd)) {
    gen = await sourceMaps.getGeneratedLocation(pos.declaration.start, source);
    genEnd = await sourceMaps.getGeneratedLocation(pos.declaration.end, source);

    if (isEqual(gen, genEnd)) {
      return null;
    }
  }

  const importName = pos.importName;
  if (typeof importName !== "string") {
    // Should never happen, just keeping Flow happy.
    return null;
  }

  return generatedAstBindings.reduce(async (acc, val) => {
    const accVal = await acc;
    if (accVal) {
      return accVal;
    }

    const desc = await mapImportDeclarationToDescriptor(val, {
      importName,
      start: gen,
      end: genEnd
    });

    return desc
      ? {
          name: val.name,
          desc
        }
      : null;
  }, null);
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
): Promise<BindingContents | null> {
  // When trying to map an actual import declaration binding, we can try
  // to map it back to the namespace object in the original code.
  if (!mappingContains(mapped, binding.loc)) {
    return null;
  }

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
  }

  return desc;
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
): Promise<BindingContents | null> {
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
    }
  }

  return desc;
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
