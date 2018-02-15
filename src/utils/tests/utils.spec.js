import { handleError, promisify, waitForMs } from "../utils";

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
