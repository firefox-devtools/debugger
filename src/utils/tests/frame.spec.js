/* eslint max-nested-callbacks: ["error", 6] */

import {
  simplifyDisplayName,
  formatDisplayName,
  formatCopyName,
  getLibraryFromUrl
} from "../frame";

const cases = {
  defaultCase: [["define", "define"]],

  objectProperty: [
    ["z.foz", "foz"],
    ["z.foz/baz", "baz"],
    ["z.foz/baz/y.bay", "bay"],
    ["outer/x.fox.bax.nx", "nx"],
    ["outer/fow.baw", "baw"],
    ["fromYUI._attach", "_attach"],
    ["Y.ClassNameManager</getClassName", "getClassName"],
    ["orion.textview.TextView</addHandler", "addHandler"],
    ["this.eventPool_.createObject", "createObject"]
  ],

  arrayProperty: [
    ["this.eventPool_[createObject]", "createObject"],
    ["jQuery.each(^)/jQuery.fn[o]", "o"],
    ["viewport[get+D]", "get+D"],
    ["arr[0]", "0"]
  ],

  functionProperty: [
    ["fromYUI._attach/<.", "_attach"],
    ["Y.ClassNameManager<", "ClassNameManager"],
    ["fromExtJS.setVisible/cb<", "cb"],
    ["fromDojo.registerWin/<", "registerWin"]
  ],

  annonymousProperty: [["jQuery.each(^)", "each"]]
};

describe("function names", () => {
  describe("simplifying display names", () => {
    Object.keys(cases).forEach(type => {
      cases[type].forEach(([kase, expected]) => {
        it(`${type} - ${kase}`, () =>
          expect(simplifyDisplayName(kase)).toEqual(expected));
      });
    });
  });

  describe("formatting display names", () => {
    it("uses a library description", () => {
      const frame = {
        library: "Backbone",
        displayName: "extend/child",
        source: {
          url: "assets/backbone.js"
        }
      };

      expect(formatDisplayName(frame)).toEqual("Create Class");
    });

    it("shortens an anonymous function", () => {
      const frame = {
        displayName: "extend/child/bar/baz",
        source: {
          url: "assets/bar.js"
        }
      };

      expect(formatDisplayName(frame)).toEqual("baz");
    });
  });

  describe("formatCopyName", () => {
    it("simple", () => {
      const frame = {
        displayName: "child",
        location: {
          line: 12
        },
        source: {
          url: "todo-view.js"
        }
      };

      expect(formatCopyName(frame)).toEqual("child (todo-view.js#12)");
    });
  });

  describe("getLibraryFromUrl", () => {
    describe("When Preact is on the frame", () => {
      it("should return Preact and not React", () => {
        const frame = {
          displayName: "name",
          location: {
            line: 12
          },
          source: {
            url: "https://cdnjs.cloudflare.com/ajax/libs/preact/8.2.5/preact.js"
          }
        };

        expect(getLibraryFromUrl(frame)).toEqual("Preact");
      });
    });
  });
});
