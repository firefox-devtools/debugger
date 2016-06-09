"use strict";

const Breakpoints = require("../Breakpoints");
const { renderComponent } = require("../test-utils");

function getBreakpoints($el) {
  return $el.querySelector(".breakpoints-list").children;
}

function getBreakpointLabel($breakpoint) {
  return $breakpoint.querySelector(".breakpoint-label").innerText;
}

describe("Breakpoint Component", function() {
  it("Not Paused", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Breakpoints, "todomvc");
    expect($el.innerText).to.equal("No Breakpoints");
  });

  it("1 Breakpoint", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Breakpoints, "todomvcUpdateOnEnter");
    const breakpoints = getBreakpoints($el);
    expect(breakpoints.length).to.equal(1);
    expect(getBreakpointLabel(breakpoints[0])).to.equal("113 this.close();");
  });
});
