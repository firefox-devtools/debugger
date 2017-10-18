import { remapScopes } from "../pause";

describe("remapsScopes", () => {
  it("no-scopes", () => {
    const scopes = null;
    const generatedScopes = [
      {
        type: "block",
        bindings: { a: "ta", b: "tb" }
      }
    ];

    expect(remapScopes(scopes, generatedScopes)).toMatchSnapshot();
  });

  it("simple", () => {
    const scopes = [
      {
        type: "function",
        bindings: { a: [], b: [] }
      },
      {
        type: "script",
        bindings: {}
      }
    ];
    const generatedScopes = [
      {
        type: "function",
        bindings: { a: "ta", b: "tb" }
      },
      {
        type: "script",
        bindings: {}
      }
    ];

    expect(remapScopes(scopes, generatedScopes)).toMatchSnapshot();
  });

  it("es6 blocks", () => {
    const scopes = [
      {
        type: "block",
        bindings: { a: [] }
      },
      {
        type: "function",
        bindings: { b: [] }
      },
      {
        type: "block",
        bindings: { c: [] }
      },
      {
        type: "script",
        bindings: {}
      }
    ];
    const generatedScopes = [
      {
        type: "function",
        bindings: { a: "ta", b: "tb" }
      },
      {
        type: "script",
        bindings: {}
      }
    ];

    expect(remapScopes(scopes, generatedScopes)).toMatchSnapshot();
  });
});
