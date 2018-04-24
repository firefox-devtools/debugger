/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

const { shallow } = require("enzyme");

const { REPS, getRep } = require("../rep");

const { Accessor, Rep } = REPS;

const stubs = require("../stubs/accessor");

describe("Accessor - getter", () => {
  const object = stubs.get("getter");

  it("Rep correctly selects Accessor Rep", () => {
    expect(getRep(object)).toBe(Accessor.rep);
  });

  it("Accessor rep has expected text content", () => {
    const renderedComponent = shallow(Rep({ object }));
    expect(renderedComponent.text()).toEqual("Getter");
  });
});

describe("Accessor - setter", () => {
  const object = stubs.get("setter");

  it("Rep correctly selects Accessor Rep", () => {
    expect(getRep(object)).toBe(Accessor.rep);
  });

  it("Accessor rep has expected text content", () => {
    const renderedComponent = shallow(Rep({ object }));
    expect(renderedComponent.text()).toEqual("Setter");
  });
});

describe("Accessor - getter & setter", () => {
  const object = stubs.get("getter setter");

  it("Rep correctly selects Accessor Rep", () => {
    expect(getRep(object)).toBe(Accessor.rep);
  });

  it("Accessor rep has expected text content", () => {
    const renderedComponent = shallow(Rep({ object }));
    expect(renderedComponent.text()).toEqual("Getter & Setter");
  });
});
