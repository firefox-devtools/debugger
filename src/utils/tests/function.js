import simplifyDisplayName from "../function";

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
  Object.keys(cases).forEach(type => {
    cases[type].forEach(([kase, expected]) => {
      it(`${type} - ${kase}`, () =>
        expect(simplifyDisplayName(kase)).toEqual(expected));
    });
  });
});
