import { filterDuplicates } from "../utils";

describe("utils", () => {
  describe("filterDuplicates", () => {
    it("all react list", () => {
      const list = [
        { id: 1, lib: "react" },
        { id: 2, lib: "react" },
        { id: 3, lib: "react" },
        { id: 4, lib: "react" }
      ];

      const filtered = filterDuplicates(
        list,
        ([prev, item]) => !(prev.lib && prev.lib == item.lib)
      );

      expect(filtered.length).toEqual(1);
      expect(filtered[0].id).toEqual(4);
    });

    it("all false list", () => {
      const list = [
        { id: 1, lib: null },
        { id: 2, lib: null },
        { id: 3, lib: null },
        { id: 4, lib: null }
      ];

      const filtered = filterDuplicates(
        list,
        ([prev, item]) => !(prev.lib && prev.lib == item.lib)
      );

      expect(filtered.length).toEqual(4);
      expect(filtered[0].id).toEqual(1);
    });

    it("interleaved list", () => {
      const list = [
        { id: 0, lib: null },
        { id: 1, lib: "react" },
        { id: 2, lib: "react" },
        { id: 3, lib: null },
        { id: 4, lib: "react" },
        { id: 5, lib: "react" },
        { id: 6, lib: null }
      ];

      const filtered = filterDuplicates(
        list,
        ([prev, item]) => !(prev.lib && prev.lib == item.lib)
      );

      expect(filtered.length).toEqual(5);
    });
  });
});
