/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

requestLongerTimeout(2);

async function stepOvers(dbg, count, onStep = () => {}) {
  let i = 0;
  while (i++ <= count) {
    await dbg.actions.stepOver();
    await waitForPaused(dbg);
    onStep(dbg.getState());
  }
}
function formatSteps(steps) {
  return steps.map(loc => `(${loc.join(",")})`).join(", ")
}

async function testCase(dbg, { name, count, steps }) {
  invokeInTab(name);
  let locations = [];

  await stepOvers(dbg, count, state => {
    const {line, column} = dbg.selectors.getTopFrame(state).location
    locations.push([line, column]);
  });

  is(formatSteps(locations), formatSteps(steps), name);
  await resume(dbg);
}

add_task(async function test() {
  const dbg = await initDebugger("doc-pause-points.html", "pause-points.js");

  await selectSource(dbg, "pause-points.js")
  await testCase(dbg, {
    name: "statements",
    count: 7,
    steps: [[9,2], [10,4], [10,13], [11,2], [11,21], [12,2], [12,12], [13,0]]
  });

  await testCase(dbg, {
    name: "expressions",
    count: 4,
    steps: [[40,2], [41,2], [41,8], [42,8], [43,0]]
  });

  await testCase(dbg, {
    name: "sequences",
    count: 5,
    steps: [[23,2], [25,8], [29,8], [31,4], [34,2], [37,0]]

  });

  await testCase(dbg, {
    name: "flow",
    count: 8,
    steps: [[16,2], [17,12], [18,6], [19,2], [19,8], [19,17], [19,8], [19,17], [19,8]]
  });
});
