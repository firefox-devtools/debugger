"use strict";

const { isDevelopment, isEnabled, setConfig } = require("../feature");
const expect = require("expect.js");

describe("feature", () => {
  it("isDevelopment", () => {
    setConfig({ development: true });
    expect(isDevelopment()).to.be.truthy;
  });

  it("isDevelopment - not defined", () => {
    setConfig({ });
    expect(isDevelopment()).to.be.falsey;
  });

  it("isEnabled - enabled", function() {
    setConfig({ featureA: true });
    expect(isEnabled("featureA")).to.be.truthy;
  });

  it("isEnabled - disabled", function() {
    setConfig({ featureA: false });
    expect(isEnabled("featureA")).to.be.falsey;
  });

  it("isEnabled - not present", function() {
    setConfig({});
    expect(isEnabled("featureA")).to.be.undefined;
  });
});
