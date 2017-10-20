import { getDomain } from "../treeOrder";

describe("getDomain", () => {
  it("parses a url and returns the host name", () => {
    expect(getDomain("http://www.mozilla.com")).toBe("mozilla.com");
  });

  it("returns null for an undefined string", () => {
    expect(getDomain(undefined)).toBe(null);
  });

  it("returns null for an empty string", () => {
    expect(getDomain("")).toBe(null);
  });

  it("returns null for a poorly formed string", () => {
    expect(getDomain("\\/~`?,.{}[]!@$%^&*")).toBe(null);
  });
});
