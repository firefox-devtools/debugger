function testLoader(source) {
  return source + "\n\n module.exports = run_test;\n";
}

module.exports = testLoader;
