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

  it("3 Breakpoints", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Breakpoints, "todomvcUpdateOnEnter");
    const breakpoints = getBreakpoints($el);
    expect(breakpoints.length).to.equal(3);
    expect(getBreakpointLabel(breakpoints[0])).to.equal("113 this.close();");
    expect(getBreakpointLabel(breakpoints[1])).to
    .equal("142 return undefined;");
    expect(getBreakpointLabel(breakpoints[2])).to
    .equal("169 var name = text.toLowerCase();");
  });
});
