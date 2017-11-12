import assert from "../assert.js";

let testAssertMessageHead, testAssertMessage;

describe("assert", () => {
  beforeEach(() => {
    testAssertMessageHead = "Assertion failure: ";
    testAssertMessage = "Test assert.js Message";
  });

  describe("when isDevelopment and the condition is truthy", () => {
    it("does not throw an Error", () => {
      expect(() => {
        assert(true, testAssertMessage);
      }).not.toThrow();
    });
  });

  describe("when isDevelopment and the condition is falsy", () => {
    it("throws an Error displaying the passed message", () => {
      expect(() => {
        assert(false, testAssertMessage);
      }).toThrow(new Error(testAssertMessageHead + testAssertMessage));
    });
  });

  describe("when not isDevelopment", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it("does not throw an Error", () => {
      expect(() => {
        assert(false, testAssertMessage);
      }).not.toThrow();
    });
  });
});
