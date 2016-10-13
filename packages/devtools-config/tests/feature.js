const { isDevelopment, getValue, isEnabled, setConfig } = require("../feature");
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

  it("getValue - enabled", function() {
    setConfig({ featureA: true });
    expect(getValue("featureA")).to.be.truthy;
  });

  it("getValue - disabled", function() {
    setConfig({ featureA: false });
    expect(getValue("featureA")).to.be.falsey;
  });

  it("getValue - not present", function() {
    setConfig({});
    expect(getValue("featureA")).to.be.undefined;
  });

  it("isEnabled - enabled", function() {
    setConfig({ features: { featureA: true }});
    expect(isEnabled("featureA")).to.be.truthy;
  });

  it("isEnabled - disabled", function() {
    setConfig({ features: { featureA: false }});
    expect(isEnabled("featureA")).to.be.falsey;
  });
});
