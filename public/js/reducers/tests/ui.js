// @flow
declare var describe: (name: string, func: () => void) => void;
declare var it: (desc: string, func: () => void) => void;

const { State, update } = require("../ui");
const expect = require("expect.js");
const C = require("../../constants");

describe("sidebar reducer", () => {
  it("should flip the collapse value for left", () => {
    let state = State();
    expect(state.collapsed).to.be(false);
    state = update(state, {
      type: C.COLLAPSE_SIDEBAR,
      collapsed: true,
      side: "left"
    });
    expect(state.collapsed).to.be(true);
    expect(state.side).to.be("left");
  });

  it("should flip the collapse value for left (default)", () => {
    let state = State();
    expect(state.collapsed).to.be(false);
    state = update(state, {
      type: C.COLLAPSE_SIDEBAR,
      collapsed: true,
    });
    expect(state.collapsed).to.be(true);
    expect(state.side).to.be("left");
  });

  it("should flip the collapse value for right", () => {
    let state = State();
    expect(state.collapsed).to.be(false);
    state = update(state, {
      type: C.COLLAPSE_SIDEBAR,
      collapsed: true,
      side: "right"
    });
    expect(state.collapsed).to.be(true);
    expect(state.side).to.be("right");
  });
});
