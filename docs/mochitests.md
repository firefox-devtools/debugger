## Mochitests

Mochitests is a test runner for integration (end-to-end) testing that allows us to test the debugger literally as a user would use it natively.

It is different from other test runners (Jest, Mocha, Jasmine) because it simulates a real user interacting with your application. For debugger, we do this by building your own version of Firefox with your changes to *debugger*. This Firefox build and its debugger is what's tested by Mochitests, in the same way that a user interacting with the debugger would natively.

If you've submitted a pull request to this project, you've already worked with Mochitests! TravisCI, which is one of the checks your PR has to pass, runs Mochitests every time you push a new commit to your PR.

- [What does Mochitests do](#what-does-mochitests-do)
- [Initial Setup](#initial-setup)
- [Running the tests](#running-the-tests)
- [Folder Overview](#folder-overview)
- [Writing tests](#writing-tests)
- [Your First Test](#your-first-test)
- [Debugging your tests](#debugging-your-tests)
- [Test Writing Tips](#test-writing-tips)
- [Adding New Test Files](#adding-new-test-files)
- [Debugging Intermittents](#debugging-intermittents)
- [Videos](#videos)
- [Appendix](#appendix)

## What does Mochitests do? ##

Simply put, its tests simulate what you expect a user to do, and then check that the expected debugger behavior happens.

Typically, tests would simulate a user's action flow through the debugger _(e.g. click this button, press this key)_. After performing a set of actions, we set assertions _(e.g. debugger is paused/not paused, elements appear/disappear)_.

[A typical test workflow would look like this.](http://g.recordit.co/dp6qbK0Jnf.gif)

## Initial Setup ##

### Mac ###

Before starting, make sure you have the most updated versions of [Homebrew](https://brew.sh/) and [Python](https://www.python.org/downloads/). Afterwards, run the following from inside the main `debugger` folder:
```
brew install mercurial
brew install autoconf@2.13 && brew unlink autoconf
./bin/prepare-mochitests-dev
```

On your first setup, `./bin/prepare-mochitests-dev` clones Firefox's repository (`mozilla-central`). Downloading all of Firefox's source files may take ~30-60 minutes depending on your internet connection.

After your initial setup, running `./bin/prepare-mochitests-dev` updates the cloned Firefox repository.

### Windows ###

The detailed instructions for setting up your environment to build Firefox for Windows can be found [here](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Windows_Prerequisites). Make sure to follow the steps under the sections **Getting ready**, **Visual Studio 2017** and **Required tools**.

Afterwards, you can open a unix-flavor shell by starting:

```
C:\mozilla-build\start-shell.bat
```

In the shell, navigate to the *debugger* project folder. On your first setup, `./bin/prepare-mochitests-dev` clones Firefox's repository (`mozilla-central`). Downloading all of Firefox's source files may take ~30-60minutes depending on your internet connection.

After your initial setup, running `./bin/prepare-mochitests-dev` updates the cloned Firefox repository.

## Running the tests ##

> NOTE: Make sure you have [Yarn](https://yarnpkg.com/) installed before proceeding with the following steps

Every time you want to run your tests, the Firefox clone needs to be rebuilt with your updated local *debugger*. To do that, run the following:

```
yarn copy
./firefox/mach build
```

After rebuilding Firefox, you are ready to run your tests! There are three options:
```
// 1) Run the tests on your Firefox clone **without pausing** on debugger statements:
yarn mochi

// 2) Run the tests on your Firefox clone **with pausing** on debugger statements:
yarn mochid

// 3) Run the tests on your Firefox clone **headlessly without pausing** on debugger statements:
yarn mochih
```

The commands above will run **all** of your tests. If you want to only run one test, you can specify a test you want to run by adding its pattern. For example, if you want to run the test `browser_dbg-tabs-keyboard.js` headlessly, you would run `yarn mochih tabs-keyboard`.

A common testing workflow is 1) editing the test or the debugger code and 2) wanting to check whether a specific test passes. A common script to run for that scenario is `yarn copy && ./firefox/mach build && yarn mochih your-test-name-here`. This copies your debugger, rebuilds Firefox and runs your test all in one go.

> NOTE: While running `yarn mochi` or `yarn mochid`, keep focus on the browser window while the tests are being run

## Folder Overview ##
All relevant Mochitest files are in `tests/mochitests`. A quick glance reveals the following:

* test files are all prefixed with `browser_dbg-`
* test runner helper functions are contained within `helpers.js`
* source files to be loaded by debugger test instances are in the folder `examples/`

## Writing tests ##
Each individual test has the following structure in common - `add_task()` is provided with an async function in which the debugger is initialized:

```js
add_task(async function() {
  const dbg = await initDebugger("page-to-be-loaded.html");

  /* Your test here */

});
```

Sometimes, your `page-to-be-loaded.html` may rely on external scripts. In that case, it's good practice to provide those sources to `initDebugger()` so that it knows to wait for those sources to be loaded before finishing the initialization.

```js
add_task(async function() {
  const dbg = await initDebugger("page-to-be-loaded.html", "source.js", "another-source.js");

  /* Your test here */

});
```

> NOTE: The root directory for any relative URL specified is `test/mochitest/examples`

## Your First Test ##
At its core, what Mochitest does is it simulates a **user action**, like a mouse click on an element, and checks whether the **expected behavior** happens. Take for example the expand/collapse behavior of the Watch Expressions pane upon clicking its header:

1. By default, the Watch Expression pane is expanded
2. If we click on the Watch Expressions header, we expect the Watch Expression pane to collapse i.e. "content" is hidden
3. If we click on the Watch Expressions header again, we expect the Watch Expression pane to expand i.e. "content" is displayed

For illustration purposes, the structure of the Watch Expression pane element looks like this:

```html
<li class="watch-expressions-pane">
  <h2 class = "_header">...</h2>
  <div class = "_content">...</div>
</li>
```

We might then write that test like this:

```js
add_task(async function() {
  const dbg = await initDebugger("doc-watch-expressions.html");

  // 1) Check whether Watch Expressions pane is expanded
  var watchExpressionsContent = findElementWithSelector(dbg, ".watch-expressions-pane ._content");
  ok(watchExpressionsContent === true, "watch expressions content is displayed")

  // 2) Click on the header to collapse the pane. Check that it's collapsed
  const watchExpressionsHeader = findElementWithSelector(dbg, ".watch-expressions-pane ._header");
  watchExpressionsHeader.click();
  watchExpressionsContent = findElementWithSelector(dbg, ".watch-expressions-pane ._content");
  ok(watchExpressionsContent === false, "watch expressions content is not displayed")

  // 3) Click on the header again to expand the pane. Check that it's expanded
  watchExpressionsHeader.click();
  watchExpressionsContent = findElementWithSelector(dbg, ".watch-expressions-pane ._content");
  ok(watchExpressionsContent === true, "watch expressions content is displayed")
});
```

While this is a simple example, most of the Mochitests you will encounter follow the same process. What's important in writing them is to know clearly the actions you expect the user to do, how the debugger should behave in response to those actions, and insert assertions to test those behaviors.

In this example, we use a few helper functions that you may not be familiar with yet. These helper functions are all in [`test/mochitest/helpers.js`](https://github.com/firefox-devtools/debugger/blob/4a1622ae7d2230e79cae049ae0e95db7960c2cc7/test/mochitest/helpers.js), and for the most part are just variants on concepts you probably already know. For example, `findElementWithSelector()` is simply a wrapper for `document.querySelector()` specifically for your debugger instance.

## Debugging your tests
While working on your tests, you might find that they're not running the way you expect them to. There are a few ways to figure out what exactly is happening and we will list them out here.

### 1) Read the logs
The first step for debugging an integration test is establishing a clear sequence of events: where did the test break and what were the events that happened before it broke. The Mochitests logs are a valuable source of information in providing this context. A quick glance at the logs may provide you with enough information to figure out what's gone wrong. These include:

* Actions that fired
* Assertions that passed/failed
* Events that the test waited for (e.g. dispatches, state changes)

We like to add additional logging in the test and debugger code with `info()` calls, which is similar to `console.log()`. Where necessary, use [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) with expressions to make `info()` calls as informative as possible.

* `info("Adding an expression")`
* `` info(`Thread event '${eventName}' fired.`) ``
* `` info(`Waiting for ${type} to dispatch ${eventRepeat} time(s)`) ``

It's worth noting that any `console.log()` statements in non-test code that runs in the debugger (e.g. React Component code) does not get outputted to the terminal. This is because those `console.log()` calls print their logs on the test browser console instead. If you need to print something to the terminal from non-test code, use `dump()` calls instead which functions similarly to `console.log()`

### 2) Freezing the debugger
Sometimes you might want to stop the test execution to see what's going on.

In that case you can insert an `await waitForever()` within your test. This doesn't technically pause the debugger, but it stops the test execution all the same because the promise never gets resolved. This allows you to see what the DOM looks like at that point in time or inspect things via the debugger/console.

```js
add_task(async function() {
  const dbg = await initDebugger("doc-watch-expressions.html");
  var watchExpressionsContent = findElementWithSelector(dbg, ".watch-expressions-pane ._content");

  // Stop the test here to inspect the DOM and see whether content really is displayed
  await waitForever();

  ok(watchExpressionsContent === true, "watch expressions content is displayed")
});
```

A similar alternative is to use `await waitForTime(ms)` which takes a millisecond(`ms`) value to wait for, instead of waiting indefinitely.

### 3) Pausing the debugger
To pause the debugger, you need to put a `debugger` statement within your tests.

```js
add_task(async function() {
  const dbg = await initDebugger("doc-watch-expressions.html");
  var watchExpressionsContent = findElementWithSelector(dbg, ".watch-expressions-pane ._content");

  // Pause the test here and use the debugger to look around
  debugger;

  ok(watchExpressionsContent === true, "watch expressions content is displayed")
});
```

This `debugger` statements is paused at **only** when you run the mochitests in debugger mode (`yarn mochid your-test-here`). While debugging with `yarn mochid`, a separate browser toolbox is opened from which you can debug the test that is currently running. While you can set breakpoints in this mode, they're not paused at - only inline `debugger` statements are paused at.

Note that these `debugger` statements are not limited to test code. They are also paused at in non-test code, which you can try by adding a `debugger` statement to a relevant React component of a test you will be running with `yarn mochid`.

## Test Writing Tips ##
By now, you should have a good grasp of the basic concepts of testing with Mochitests.

At this point, it's worth taking some time to become familiar with the helper methods in [helpers.js](https://github.com/firefox-devtools/debugger/blob/4a1622ae7d2230e79cae049ae0e95db7960c2cc7/test/mochitest/helpers.js). Below, we list some common patterns that come up while testing, and "best practices" for how to deal with them using the helper methods.

### Waiting in a test
It's common to want to wait for something to happen in a test. Generally we wait for one of two things to happen:

1. Waiting for the Redux state to change

```js
add_task(async function() {
  const dbg = await initDebugger("doc-sourcemaps.html", "entry.js");
  const entrySrc = findSource(dbg, "entry.js");

  await addBreakpoint(dbg, entrySrc, 5);
  await addBreakpoint(dbg, entrySrc, 13);
  await addBreakpoint(dbg, entrySrc, 15);

  // We use waitForState() here to make sure that our predicate function returns true before the is() assertion
  await waitForState(dbg, state => dbg.selectors.getBreakpointCount(state) === 3);
  is(getBreakpointCount(getState()), 3, "Three breakpoints exist");
});
```

2. Waiting for a Redux action to be dispatched

```js
add_task(async function() {
  const dbg = await initDebugger("doc-scripts.html", "simple1");

  await selectSource(dbg, "simple1");
  is(countTabs(dbg), 1);
  pressKey(dbg, "close");

  // We use waitForDispatch() here to make sure that the CLOSE_TAB action has fired before our assertion counts the tabs
  // Otherwise our assertion may count the tabs before the tab is actually closed
  waitForDispatch(dbg, "CLOSE_TAB");
  is(countTabs(dbg), 0);
});
```

### Finding DOM elements
You can find elements defined in the debugger instance's DOM by using either:

1. `findElement()` which takes an element name from the shared `selectors` object defined in [helpers.js](https://github.com/firefox-devtools/debugger/blob/4a1622ae7d2230e79cae049ae0e95db7960c2cc7/test/mochitest/helpers.js).

```js
add_task(async function() {
  const dbg = await initDebugger("doc-minified.html", "math.min.js");
  await selectSource(dbg, "math.min.js", 2);

  // We use findElement() here to find the pretty print button within the DOM.
  // The second argument passed (prettyPrintButton) should correspond to an Object key to the selector variable in helpers.js
  const prettyPrintButton = findElement(dbg, "prettyPrintButton");
  ok(Boolean(prettyPrintButton), "Pretty Print Button is hidden");
});
```

2. `findElementWithSelector()` which takes a selector.

```js
add_task(async function() {
  const dbg = await initDebugger("doc-minified.html", "math.min.js");
  await selectSource(dbg, "math.min.js", 2);

  // We use findElement() here to find the pretty print button within the DOM.
  // The second argument passed (prettyPrintButton) should correspond to an Object key to the selector variable in helpers.js
  const prettyPrintButton = findElementWithSelector(dbg, ".source-footer .prettyPrint");
  ok(Boolean(prettyPrintButton), "Pretty Print Button is hidden");
});
```

### Evaluating in the debuggee ###
If you want to evaluate a function in the debuggee context you can use the `invokeInTab` function. This invokes a function that is defined within the page itself.

```js
invokeInTab(dbg, "doSomething");
```

You can invoke functions that are from a page's external script file, like you would in the console. For example, if the tab's page "myPage.html" loads an external script "script.js" and within "script.js" there is a function "myScriptFunction()", you can invoke it like this:

```js
invokeInTab(dbg, "myScriptFunction")
```

You can also invoke document methods this way:

```js
invokeInTab(dbg, "content.document.querySelector('.source-footer .prettyPrint')")

// You can also click a button this way
invokeInTab(dbg, "content.document.querySelector('.source-footer .prettyPrint').click()")
```

### Using Debugger (DBG) helpers ###
The `dbg` object returned by `initDebugger()` has several helpful properties, e.g., `actions`, `selectors`, `getState`, `store`, `toolbox`, `win`. [Click here](https://github.com/firefox-devtools/debugger/blob/7cdf5a1e99de51a551a5814f34ca8fb7506e06fb/docs/dbg.md) to learn more about these helpers.

## Adding New Test Files ##

If you add new tests files, make sure to list them in the `browser.ini` file. You will see the other test files there. Add a new entry with the same format as the others. You can also add new JS or HTML files by listing in under `support-files`.

## Debugging Intermittents ##

Intermittents are when a test succeeds most the time (~95%) of the time, but not all the time. There are several easy traps that result in intermittents:

### Browser Inconsistencies ###
Sometimes the server is not as consistent as you would like. For example, reloading can sometimes cause sources to load out of order, or stepping too quickly can cause the debugger to enter a bad state.

A memorable example of this type of inconsistency came when debugging [stepping behavior](https://github.com/firefox-devtools/debugger/commit/7e54e6b46181b747a828ab2dc1db96c88313db95#diff-4fb7729ef51f162ae50b7c3bc020a1e3). It turns out that 1% of the time the browser toolbox will step into an unexpected location. The solution is to loosen our expectations :)

### Missed Action ###
Sometimes action "B" can fire before action "A" is done. This is a race condition that can be hard to track down. When you suspect this might happen, it is a good practice to start listening for "B" before you fire action "A".

[Here's](https://github.com/firefox-devtools/debugger/commit/7b4762d9333108b15d81bc41e12182370c81e81c) an example where this happened with reloading.

### State Changes ###
One common way tests start failing occurs when the Redux actions introduces a new asynchronous operation. A good way to safe guard your tests is to wait on state to have certain values.

For example, a test that we fixed was [pretty printing](https://github.com/firefox-devtools/debugger/commit/6a66ce54faf8239fb358462c53c022a75615aae6#diff-a81153d2e92178917a135261f4245c39R12). The test initially waited for the "select source" action to fire, which wasn't predictable. Switching the test to wait for the formatted source to exist first simplified the test tremendously.

## Videos ##

If you're looking for some tutorials on how to write and debug mochitests

- [How We Test the Debugger][testing]
- [Mochitest (Pause on Next)][testing2]

[testing]: https://www.youtube.com/watch?v=5K9Sx5529JE&t=547s
[testing2]: https://www.youtube.com/watch?v=E3QIwrcKnwg

## Appendix ##

### Mochitest CLI

The mochitest cli has a lot of advanced options that are worth learning about. Here is a quick intro in how it can be used

```
cd firefox
./mach mochitest devtools/client/debugger # runs all the debugger tests
./mach mochitest browser_dbg-editor-highlight # runs one test
./mach mochitest --jsdebugger browser_dbg-editor-highlight # runs one test with the browser toolbox open
```

Visit the [mochitest](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) MDN page to learn more about Mochitests and its more advanced arguments.

### Troubleshooting Test Harness

If symbolic link is suddenly lost between debugger and Firefox source, in your terminal, try the following

1. Navigate to the firefox directory (i.e. `cd ~/debugger/firefox`)
2. Execute `./mach mochitest --headless devtools/client/debugger`

If a symbolic link occurs, error message(s) will be displayed.

![Test harness with symbolic link errors](http://i40.photobucket.com/albums/e250/md2k6/Public/Opensource/debugger-6297/mochitest-error_zpsgicbau0z.jpg)

3. Execute `./bin/prepare-mochitests-dev`.

Running this command again allows the preparation script to check the integrity of the firefox directory and all symbolic links. It will then automatically execute `yarn copy` on your behalf, which ensures the symbolic linking process is complete.

4. On a new terminal tab, execute the command to run your test again. If this failed, proceed to step 5.

5. Execute `./mach configure`

This will attempt to fix the harness' configurations.

### Missing Rust compiler

If you are having issues running mochitest due to missing the Rust compiler, try the following:

1. In the root directory of the project (i.e. `debugger/`), execute `./mach configure`.

2. Execute `yarn watch`

3. Open a new terminal tab and run your tests again. If this failed, proceed to step 4 and 5.

4. Execute `./mach bootstrap`.

5. Execute `./bin/prepare-mochitests-dev`.

You may see warnings along the way and the process may appear to be frozen. Please be patient, this is expected as it will take a while to recompile. Warning messages does not mean the compilation process has failed.

6. Repeat steps 2 and 3.
