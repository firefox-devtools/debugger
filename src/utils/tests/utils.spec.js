import {
  handleError,
  promisify,
  endTruncateStr,
  throttle,
  waitForMs
} from "../utils";

describe("handleError()", () => {
  const testErrorText = "ERROR: ";
  const testErrorObject = { oh: "noes" };

  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  it("logs error text with error value", () => {
    handleError(testErrorObject);

    expect(console.log).toBeCalledWith(testErrorText, testErrorObject);
  });
});

describe("promisify()", () => {
  let testPromise, testContext, testMethod, testArgs;

  beforeEach(() => {
    testContext = {};
    testMethod = jest.fn();
    testArgs = [];
  });

  it("returns a Promise", () => {
    testPromise = promisify(testContext, testMethod, testArgs);

    expect(testPromise instanceof Promise).toBe(true);
  });

  it("applies promisified method", () => {
    testPromise = promisify(testContext, testMethod, testArgs);

    expect(testMethod).toBeCalledWith(testArgs, expect.anything());
  });
});

describe("endTruncateStr()", () => {
  let testString;
  const testSize = 11;

  describe("when the string is larger than the specified size", () => {
    it("returns an elipsis and characters at the end of the string", () => {
      testString = "Mozilla Firefox is my favorite web browser";

      expect(endTruncateStr(testString, testSize)).toBe("...web browser");
    });
  });

  describe("when the string is not larger than the specified size", () => {
    it("returns the string unchanged", () => {
      testString = "Firefox";

      expect(endTruncateStr(testString, testSize)).toBe(testString);
    });
  });
});

describe("throttle()", () => {
  let throttledFunction, throttledCallback;
  const testMilliseconds = 10000;

  jest.useFakeTimers();

  afterAll(() => {
    jest.clearAllTimers();
  });

  it("prevents subsequent function calls until specified time", () => {
    throttledCallback = jest.fn();
    throttledFunction = throttle(throttledCallback, testMilliseconds);

    throttledFunction();
    throttledFunction();
    throttledFunction();

    expect(throttledCallback.mock.calls.length).toBe(0);

    jest.runAllTimers();

    expect(throttledCallback.mock.calls.length).toBe(1);
  });
});

describe("waitForMs()", () => {
  let testPromise;
  const testMilliseconds = 10;

  beforeEach(() => {
    global.setTimeout = jest.fn();
  });

  it("returns a Promise", () => {
    testPromise = waitForMs(testMilliseconds);

    expect(testPromise instanceof Promise).toBe(true);
  });

  it("calls setTimeout() on the resolve of the Promise", () => {
    testPromise = waitForMs(testMilliseconds);

    expect(setTimeout).toBeCalledWith(expect.anything(), testMilliseconds);
  });
});
