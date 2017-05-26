function expr() {
  const obj = { a: { b: 2 } };
  const obj2 = { c: { b: 3 } };
  const foo = obj2.c.secondProperty;
  return obj.a.b;
  const evil = obj2.doEvil().c.secondProperty;
}
