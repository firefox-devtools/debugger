/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

// eslint-disable-next-line max-len
import { findGeneratedBindingFromPosition } from "./findGeneratedBindingFromPosition";

import type { GeneratedBindingLocation } from "./types";
import type { BindingData } from "../../workers/parser";

export async function findGeneratedBinding(
  sourceMaps: any,
  client: any,
  source: Source,
  name: string,
  originalBinding: BindingData,
  generatedAstBindings: Array<GeneratedBindingLocation>
): Promise<?{
  grip: BindingContents,
  expression: string | null
}> {
  // If there are no references to the implicits, then we have no way to
  // even attempt to map it back to the original since there is no location
  // data to use. Bail out instead of just showing it as unmapped.
  if (
    originalBinding.type === "implicit" &&
    !originalBinding.refs.some(item => item.type === "ref")
  ) {
    return null;
  }

  const { refs } = originalBinding;

  const genContent = await refs.reduce(async (acc, pos) => {
    const result = await acc;
    if (result) {
      return result;
    }

    return await findGeneratedBindingFromPosition(
      sourceMaps,
      client,
      source,
      pos,
      name,
      originalBinding.type,
      generatedAstBindings
    );
  }, null);

  if (genContent && genContent.desc) {
    return {
      grip: genContent.desc,
      expression: genContent.expression
    };
  } else if (genContent) {
    // If there is no descriptor for 'this', then this is not the top-level
    // 'this' that the server gave us a binding for, and we can just ignore it.
    if (name === "this") {
      return null;
    }

    // If the location is found but the descriptor is not, then it
    // means that the server scope information didn't match the scope
    // information from the DevTools parsed scopes.
    return {
      grip: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: {
          type: "unscoped",
          unscoped: true,

          // HACK: Until support for "unscoped" lands in devtools-reps,
          // this will make these show as (unavailable).
          missingArguments: true
        }
      },
      expression: null
    };
  }

  // If no location mapping is found, then the map is bad, or
  // the map is okay but it original location is inside
  // of some scope, but the generated location is outside, leading
  // us to search for bindings that don't technically exist.
  return {
    grip: {
      configurable: false,
      enumerable: true,
      writable: false,
      value: {
        type: "unmapped",
        unmapped: true,

        // HACK: Until support for "unmapped" lands in devtools-reps,
        // this will make these show as (unavailable).
        missingArguments: true
      }
    },
    expression: null
  };
}
