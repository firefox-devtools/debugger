// const obj = { a: { b: 2 } };
// const obj2 = { c: { d: 3 } };
// const foo = obj2.c.secondProperty;
//
// // computed properties
// const com = {[a]: {b: 'c'}, [b]: 3}
//
// // assignments
// obj.foo = {a: {b: 'c'}, b: 3}
// com = {a: {b: 'c'}, b: 3}
//
// // destructuring
// const { a, rest } = compute(stuff);
// const [a, ..rest] = compute(stuff);
const [a, ...rest] = compute(stuff);

//
// function params({a,b}) {}
//
// const evil = obj2.doEvil().c.secondProperty;
