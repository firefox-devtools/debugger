async function foo() {
  bar();
  await slow();
  bazz();
}
