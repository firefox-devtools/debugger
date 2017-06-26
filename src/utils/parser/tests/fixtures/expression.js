/*
const obj = { a: { b: 2 } };
const obj2 = { c: { d: 3 } };
const foo = obj2.c.secondProperty;

// computed properties
const com = { [a]: { b: "c" }, [b]: 3 }; // e.g. com[a].b

// assignments
obj.foo = { a: { b: "c" }, b: 3 }; // e.g. obj.foo.a.b
com = { a: { b: "c" }, b: 3 }; // e.g. com.a.b
*/

// arrays
// com = {a: {b: 'c'}, b: 3}  // e.g. com.a.b

const res = [{ a: 2 }, { b: 3 }]; // e.g. res[1].b
// const res = {a: [{b: 2}]}  // e.g. res.a[0].b

// const res = [[{a:3}],[{b:3}]] // e.g. res[1][0].b
/*
// destructuring
const { a, rest } = compute(stuff);
// const [a, ...rest] = compute(stuff);

function params({ a, b }) {}
var pars = function({ a, b }) {};

const evil = obj2.doEvil().c.secondProperty;
*/
