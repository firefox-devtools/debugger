"use strict";

const { isDevelopment, isEnabled, stubConfig } = require("../feature");
const expect = require("expect.js");

describe("feature", () => {
  it("isDevelopment", () => {
    stubConfig({ development: true });
    expect(isDevelopment()).to.be.truthy;
  });

  it("isDevelopment - not defined", () => {
    stubConfig({ });
    expect(isDevelopment()).to.be.falsey;
  });

  it("isEnabled - enabled", function() {
    stubConfig({ featureA: true });
    expect(isEnabled("featureA")).to.be.truthy;
  });

  it("isEnabled - disabled", function() {
    stubConfig({ featureA: false });
    expect(isEnabled("featureA")).to.be.falsey;
  });

  it("isEnabled - not present", function() {
    stubConfig({});
    expect(isEnabled("featureA")).to.be.undefined;
  });
});
