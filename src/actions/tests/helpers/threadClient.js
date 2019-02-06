/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type {
  SourceActor,
  SourceActorLocation,
  BreakpointOptions
} from "../../../types";

function createSource(name) {
  name = name.replace(/\..*$/, "");
  return {
    source: `function ${name}() {\n  return ${name} \n}`,
    contentType: "text/javascript"
  };
}

const sources = [
  "a",
  "b",
  "foo",
  "bar",
  "foo1",
  "foo2",
  "a.js",
  "baz.js",
  "foobar.js",
  "barfoo.js",
  "foo.js",
  "bar.js",
  "base.js",
  "bazz.js",
  "jquery.js"
];

export const simpleMockThreadClient = {
  getBreakpointByLocation: (jest.fn(): any),
  setBreakpoint: (location: SourceActorLocation, _condition: string) =>
    Promise.resolve({ id: "hi", actualLocation: location }),

  removeBreakpoint: (_id: string) => Promise.resolve(),

  setBreakpointOptions: (
    _id: string,
    _location: SourceActorLocation,
    _options: BreakpointOptions,
    _noSliding: boolean
  ) => Promise.resolve({ sourceId: "a", line: 5 }),
  setPausePoints: () => Promise.resolve({}),
  sourceContents: ({
    source
  }: SourceActor): Promise<{| source: any, contentType: ?string |}> =>
    new Promise((resolve, reject) => {
      if (sources.includes(source)) {
        resolve(createSource(source));
      }

      reject(`unknown source: ${source}`);
    })
};

// sources and tabs
export const sourceThreadClient = {
  sourceContents: function({
    source
  }: SourceActor): Promise<{| source: any, contentType: ?string |}> {
    return new Promise((resolve, reject) => {
      if (sources.includes(source)) {
        resolve(createSource(source));
      }

      reject(`unknown source: ${source}`);
    });
  },
  threadClient: async () => {},
  getFrameScopes: async () => {},
  setPausePoints: async () => {},
  evaluateExpressions: async () => {}
};
