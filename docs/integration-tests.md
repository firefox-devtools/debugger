## Integration Tests

+ [Overview](#overview)
+ [Running Tests](#running-tests)
+ [Writing Tests](#writing-tests)
+ [Adding a New Test](#adding-a-new-test)

### Overview

The integration tests are async functions that drive the debugger in two contexts: firefox and the web.

**Firefox** the tests are run in the panel with [mochitest].
**Web** the tests are run in an iframe with [mocha].

### Running Tests

* Running: `localhost:8000/integration`
* Selecting a test: Go to `runner.js` and add `it.only` to select which tests to run
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

### Adding a New Test

There are couple of things to do when adding a new test:

1. create a new test file
2. add the test to the `tests/index`
3. add the test to web `[runner]`
4. add the test mochitests
5. add the test to browser.ini


#### 1. create a new test file

```diff
diff --git a/src/test/integration/tests/expression.js b/src/test/integration/tests/expression.js
new file mode 100644
index 0000000..6d8d069
--- /dev/null
+++ b/src/test/integration/tests/expression.js
@@ -0,0 +1,14 @@
+const {
+  initDebugger,
+  assertPausedLocation,
+  findSource,
+  addBreakpoint
+} = require("../utils")
+
+// tests the watch expressions component
+
+module.exports = async function(ctx) {
+  const { ok, is, info, requestLongerTimeout } = ctx;
+  const dbg = await initDebugger("doc-scripts.html");
+  await waitForPaused(dbg);
+});
```

#### 2. add the test to the `tests/index`

```diff
diff --git a/src/test/integration/tests/index.js b/src/test/integration/tests/index.js
index d07089d..f0b699b 100644
--- a/src/test/integration/tests/index.js
+++ b/src/test/integration/tests/index.js
@@ -3,6 +3,7 @@ module.exports = {
   breaking: require("./breaking"),
   breakpoints: require("./breakpoints"),
   breakpointsCond: require("./breakpoints-cond"),
+  expressions: require("./expressions"),
   callStack: require("./call-stack"),
   debuggerButtons: require("./debugger-buttons"),
```

#### 3. add the test to web `[runner]`

```diff
diff --git a/src/test/integration/runner.js b/src/test/integration/runner.js
index 2a2a329..63c7d24 100644
--- a/src/test/integration/runner.js
+++ b/src/test/integration/runner.js
@@ -9,6 +9,7 @@ const {
   breakpoints,
   breakpointsCond,
   callStack,
+  expressions,
   debuggerButtons,
   editorSelect,
   editorGutter,
@@ -92,6 +93,10 @@ describe("Tests", () => {
     await editorHighlight(ctx);
   });

+  it("expressions", async function() {
+    await expressions(ctx);
+  });
+
```

#### 4. add the test mochitests

```diff
diff --git a/src/test/mochitest/browser_dbg-expression.js b/src/test/mochitest/browser_dbg-expression.js
new file mode 100644
index 0000000..43dd018
--- /dev/null
+++ b/src/test/mochitest/browser_dbg-expression.js
@@ -0,0 +1,12 @@
+/* Any copyright is dedicated to the Public Domain.
+ * http://creativecommons.org/publicdomain/zero/1.0/ */
+
+const {
+  setupTestRunner,
+  expressions
+} = require("devtools/client/debugger/new/integration-tests");
+
+add_task(function*() {
+  setupTestRunner(this);
+  yield expressions(this);
+});
```

#### 5. add the test to browser.ini

```diff
diff --git a/src/test/mochitest/browser.ini b/src/test/mochitest/browser.ini
index 108a3da..d059634 100644
--- a/src/test/mochitest/browser.ini
+++ b/src/test/mochitest/browser.ini
@@ -46,6 +46,7 @@ skip-if = true
 [browser_dbg-breakpoints.js]
 [browser_dbg-breakpoints-cond.js]
 [browser_dbg-call-stack.js]
+[browser_dbg-expressions.js]
 [browser_dbg-scopes.js]
 [browser_dbg-chrome-create.js]
```


[commands]: ../src/test/integration/utils/commands.js
[waiting]: ../src/test/integration/utils/wait.js
[assertions]: ../src/test/integration/utils/assert.js
[typing]: ../src/test/integration/utils/type.js
[clicking]: ../src/test/integration/utils/mouse-events.js
[mocha.js]: ../src/test/integration/utils/mocha.js
[mochitest.js]: ../src/test/integration/utils/mochitest.js
[examples-dir]: ../src/test/mochitest/examples
[runner]: ../src/test/integration/runner.js


[mochitest]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
[mocha]: https://mochajs.org/
