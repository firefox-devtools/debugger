function expr() {
  const obj = { a: { b: 2 } };
  const obj2 = { c: { b: 3 } };
  const foo = obj2.c.b;
  return obj.a.b;
}
