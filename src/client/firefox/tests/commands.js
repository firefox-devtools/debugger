import { setupCommands, clientCommands } from "../commands";

function makeThreadCLient(resp) {
  return {
    pauseGrip: () => ({
      getPrototypeAndProperties: async () => resp
    })
  };
}

describe("firefox commands", () => {
  describe("getProperties", () => {
    it("empty response", async () => {
      const { getProperties } = clientCommands;
      const threadClient = makeThreadCLient({
        ownProperties: {},
        safeGetterValues: {}
      });

      setupCommands({ threadClient });
      const props = await getProperties({});
      expect(props).toEqual({ ownProperties: {}, safeGetterValues: {} });
    });

    it("simple properties", async () => {
      const { getProperties } = clientCommands;
      const threadClient = makeThreadCLient({
        ownProperties: {
          obj: { value: "obj" },
          foo: { value: "foo" }
        },
        safeGetterValues: {}
      });

      const expected = {
        ownProperties: { foo: { value: "foo" }, obj: { value: "obj" } },
        safeGetterValues: {}
      };

      setupCommands({ threadClient });
      const props = await getProperties({});
      expect(props).toEqual(expected);
    });

    it("getter values", async () => {
      const { getProperties } = clientCommands;
      const threadClient = makeThreadCLient({
        ownProperties: {
          obj: { value: "obj" },
          foo: { value: "foo" }
        },
        safeGetterValues: {
          obj: { getterValue: "getter" }
        }
      });

      const expected = {
        ownProperties: { foo: { value: "foo" }, obj: { value: "getter" } },
        safeGetterValues: {
          obj: { getterValue: "getter" }
        }
      };

      setupCommands({ threadClient });
      const props = await getProperties({});
      expect(props).toEqual(expected);
    });

    it("new getter values", async () => {
      const { getProperties } = clientCommands;
      const threadClient = makeThreadCLient({
        ownProperties: {
          foo: { value: "foo" }
        },
        safeGetterValues: {
          obj: { getterValue: "getter" }
        }
      });

      const expected = {
        ownProperties: {
          foo: { value: "foo" },
          obj: { getterValue: "getter", value: "getter" }
        },
        safeGetterValues: {
          obj: { getterValue: "getter" }
        }
      };

      setupCommands({ threadClient });
      const props = await getProperties({});
      expect(props).toEqual(expected);
    });
  });
});
