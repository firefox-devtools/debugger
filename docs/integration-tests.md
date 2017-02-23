## Integration Tests

+ [Overview](#overview)
+ [Running Tests](#running-tests)
+ [Writing Tests](#writing-tests)

### Overview

The integration tests are async functions that drive the debugger in two contexts: firefox and the web.

**Firefox** the tests are run in the panel with [mochitest].
**Web** the tests are run in an iframe with [mocha].

### Running Tests

* Running: `localhost:8000/integration`
* Selecting a test: Go to `runner.js` and add `it.only` to select which tests to ren
* Skipping a test: Go to `runner.js` and replace `it` with `xit` to skip a test

### Writing Tests

* Helpers for writing: [commands], [assertions], and [waiting] on asynchronous actions.
* Utilities for [typing] and [clicking]
* Environment specific utilities [mocha.js] [mochitest.js]
* Assertions: `ok`, `is`
* HTML Examples are [here][examples-dir]


**Example:**

```js
async function test2(ctx) {
  const { ok, is, info } = ctx;

  // open the debugger and navigate the debuggee to `doc-frames.html`
  const dbg = await initDebugger("doc-frames.html");

  toggleCallStack(dbg);

  // pause inside of startRecursion so that we can test a large call stack
  invokeInTab(dbg, "startRecursion");
  await waitForPaused(dbg);

  ok(isFrameSelected(dbg, 1, "recurseA"), "the first frame is selected");
}
```

[command]: ../src/test/integration/utils/commands.js
[waiting]: ../src/test/integration/utils/wait.js
[assertions]: ../src/test/integration/utils/wait.js
[typing]: ../src/test/integration/utils/type.js
[clicking]: ../src/test/integration/utils/mouse-events.js
[mocha.js]: ../src/test/integration/utils/mocha.js
[mochitest.js]: ../src/test/integration/utils/mochitest.js
[examples-dir]: ../src/test/mochitest/examples


[mochitest]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
[mochajs]: https://mochajs.org/
