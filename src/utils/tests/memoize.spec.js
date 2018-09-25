/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import memoize from "../memoize";

const a = {
  number: 3
};
const b = {
  number: 4
};
const c = {
  number: 5
};
const d = {
  number: 6
};

function add(...numberObjects) {
  return numberObjects.reduce((prev, cur) => prev + cur.number, 0);
}

describe("memozie", () => {
  it("should work for one arg as key", () => {
    const memoizedAdd = memoize(1, add);
    expect(memoizedAdd(a, b)).toEqual(7);
    expect(memoizedAdd(a, c)).toEqual(7);
  });

  it("should work for two args as key", () => {
    const memoizedAdd = memoize(2, add);
    expect(memoizedAdd(a, b, d)).toEqual(13);
    expect(memoizedAdd(a, b, c)).toEqual(13);
    expect(memoizedAdd(b, c)).toEqual(9);
    expect(memoizedAdd(b, a)).toEqual(7);
  });

  it("should work for three args as key", () => {
    const memoizeAdd = memoize(3, add);
    expect(memoizeAdd(a, b, c, d)).toEqual(18);
    expect(memoizeAdd(a, b, c, b)).toEqual(18);
    expect(memoizeAdd(a, b, c, a)).toEqual(18);
    expect(memoizeAdd(a, a, b, d)).toEqual(16);
    expect(memoizeAdd(a, a, b, c)).toEqual(16);
  });
});
