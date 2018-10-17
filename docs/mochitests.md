## Mochitests

* [Getting Started](#getting-started)
* [Running the tests](#running-the-tests)
* [Mochi](#mochi)
* [Writing Tests](#writing-tests)
* [Debugging Intermittents](#debugging-intermittents)
* [Troubleshooting Test Harness](#troubleshooting-test-harness)
  * [Missing Rust compiler](#missing-rust-compiler)

We use [mochitests] to do integration testing. Mochitests are part of Firefox and allow us to test the debugger literally as you would use it (as a devtools panel).

Mochitests are different from Jest, Mocha, Selenium, because we have access to firefox internals and run inside the browser toolbox. This makes it possible to write tests as if we're a user interacting with the debugger natively :)

![](http://g.recordit.co/dp6qbK0Jnf.gif)

### Getting Started

**Requirements**

* mercurial ( `brew install mercurial` )
* autoconf213 ( `brew install autoconf@2.13 && brew unlink autoconf` )

**Setup Firefox**

* Inside the main debugger.html folder run:

```
./bin/prepare-mochitests-dev
```

This command will either clone `mozilla-central` (the firefox repo) or update it.
It also sets up a symlink for the tests so that changes in `src/test/mochitest` are
reflected in the new firefox directory.

### Running the tests

* `yarn watch` copies new bundles into the firefox directory
* `yarn mochi` runs the tests in a second process

### Mochi

`mochi` passes its params along to `mochitest`, so you can include `--jsdebugger` and test globs

* `yarn mochi dbg-editor-highlight` runs just one test
* `yarn mochid dbg-editor-highlight` opens a browser toolbox
* `yarn mochih dbg-editor-highlight` runs the test headlessly

## Writing Tests

Here are a few tips for writing mochitests:

* There are lots of great helper methods in [head]
* Try to write async user actions that involve a user action like clicking a button or typing a key press followed by a redux action to listen for. For example, the user step in action involves the user clicking the step in button followed by the "stepIn" action firing.
* The `dbg` object has several helpful properties (actions, selectors, getState, store, toolbox, win)

### Videos

If you're looking for some tutorials on how to write and debug mochitests

* [How We Test the Debugger][testing]
* [Mochitest (Pause on Next)][testing2]

[testing]: https://www.youtube.com/watch?v=5K9Sx5529JE&t=547s
[testing2]: https://www.youtube.com/watch?v=E3QIwrcKnwg

### Logging

The mochitests run in a special environment, which make `console.log` a little different than usual.
`console.log` inside the test will print to the terminal. `console.log` in the debugger source, will be redirected to the browser console and will not be outputed. This is why we recommend using the special firefox `dump` call which is available everywhere.

If you want a convenience method for logging in the test, `log` is a bit cleaner than `dump`.

```js
console.log(">>> YO");
log("FOO", { t: 3 });
dump(">> FOOO\n");
```

### Pausing the test

There are two ways to pause the tests and see what is going on.

The first is to add a `debugger` statement to the test and run `yarn mochid {test_name}` (ex: `dbg-sources`). Here you'll have to click a modal when the test opens. When the test pauses, the browser toolbox will show your test with the `dbg` object you can interact with.

The other way is to add `await waitForever()` to your test. This stops the test and gives you a chance to interact with the debugger as the user would. Both ways of pausing are useful for different use cases!

### Waiting in a test

It's really common to want to wait for something to happen in a test. Generally we wait for one of two things to happen:

* waiting for the Redux state to change
* waiting for an action to be dispatched

```js
await waitForState(dbg, state => isPaused(state));
await waitForDispatch(dbg, "STEP_OVER";)
```

### Testing the DOM

You can find common elements in the debugger with the `findElement` function,
which use shared selectors. You can also find any element with the
`findElementWithSelector` function.

```js
findElement(dbg, "sourceNode", 3);
findElementWithSelector(dbg, ".sources-list .focused");
```

### Evaluating in the debuggee

If you want to evaluate a function in the debuggee context you can use
the `invokeInTab` function. Under the hood it is using `ContentTask.spawn`.

```js
invokeInTab(dbg, "doSomething");
```

```js
ContentTask.spawn(gBrowser.selectedBrowser, null, function*() {
  content.wrappedJSObject.foo();
});
```

The above calls the function `foo` that exists in the page itself. You can also access the DOM this way: `content.document.querySelector`, if you want to click a button or do other things. You can even you use assertions inside this callback to check DOM state.

### Debugging Tips

The first step for debugging an integration test is establishing a clear sequence of events: where did the test break and what were the events that preceded it.

The mochitest logs provide some context:

1.  The actions that fired
2.  Assertion Passes/Failures
3.  Events that the test waited for: dispatches, state changes

> NOTE: it might be nice to run the tests in headless mode: `yarn mochih browser_dbg-editor-highlight`

![](https://shipusercontent.com/90d3d0484aedcdbe9e2bc1aa291a6eb8/Screen%20Shot%202017-10-26%20at%205.42.41%20PM.png)

**In depth [walk through][ex]**

[ex]: https://docs.google.com/document/d/1kH36V0bue0U_8Jmd2ohMutByMf4g8_iFNbTCx15d0kE/edit#

The next step is to add additional logging in the test and debugger code with `info` calls.
We recommend prefixing your logs and formatting them so they are easy to scan e.g.:

* `info(">> Add breakpoint ${line} -> ${condition}\n")`
* `info(">> Current breakpoints ${breakpoints.map(bp => bp.location.line).join(", ")}\n")`
* `info(">> Symbols for source ${source.url} ${JSON.stringify(symbols)}\n")`

At some point, it can be nice to pause the test and debug it. Mochitest makes it easy to pause the test at `debugger` statements with the `--jsdebugger` flag.
You can run the test with `yarn mochid {test_name}` (ex: `browser_dbg-editor-highlight`).

![](https://shipusercontent.com/e8441c77ab9ff6e84e5561b05bc25da2/Screen%20Shot%202017-10-26%20at%205.45.05%20PM.png)
![](https://shipusercontent.com/57e41ae7227a46b2b6ae8b66956729ea/Screen%20Shot%202017-10-26%20at%205.44.54%20PM.png)

#### Debugging Intermittents

Intermittents are when a test succeeds most the time (95%) of the time, but not all the time.
There are several easy traps that result in intermittents:

* **browser inconsistencies** sometimes the server is not as consistent as you would like. For instance, reloading can sometimes cause sources to load out of order. Also stepping too quickly can cause the debugger to enter a bad state. A memorable example of this type of inconsistency came when debugging stepping behavior. It turns out that 1% of the time the browser toolbox will step into an [unexpected location][server-oops]. The solution is too loosen our expectations :)
* **missed actions** sometimes action "B" can fire before action "A" is done. This is a race condition that can be hard to track down. When you suspect this might happen, it is a good practice to start listening for "B" before you fire action "A". Here's an example where this happened with [reloading][waiting].
* **state changes** One common way tests start failing occurs when the redux actions introduces a new asynchronous operation. A good way to safe guard your tests is to wait on state to have certain values. An example, of a test that we recently fixed was [pretty printing][pretty-printing]. The test initially waited for the "select source" action to fire, which was occasionally racey. Switching the test to wait for the formatted source to exist simplified the test tremendously.

### Appendix

#### Mochitest CLI

The mochitest cli has a lot of advanced options that are worth learning about.
Here is a quick intro in how it can be used

```
cd firefox
./mach mochitest devtools/client/debugger/new # runs all the debugger tests
./mach mochitest browser_dbg-editor-highlight # runs one test
./mach mochitest --jsdebugger browser_dbg-editor-highlight # runs one test with the browser toolbox open
```

Visit the [mochitest](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) MDN page to learn more about mochitests and more advanced arguments. A few tips:

#### For Windows Developers

The detailed instructions for setting up your environment to build Firefox for Windows can be found [here](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Windows_Prerequisites). You need to install the latest `MozBuild` package. You can open a unix-flavor shell by starting:

```
C:\mozilla-build\start-shell.bat
```

In the shell, navigate to the debugger.html project folder, and follow the Getting Started instructions as mentioned.

### Watching for Changes

The mochitest are running against the compiled debugger bundle inside the Firefox checkout. This means that you need to update the bundle whenever you make code changes. `prepare-mochitests-dev` does this for you initially, but you can manually update it with:

```
yarn copy
```

That will build the debugger and copy over all the relevant files into `firefox`, including mochitests. If you want it to only symlink the mochitests directory, pass `--symlink-mochitests` (which is what `prepare-mochitests-dev` does).

It's annoying to have to manually update the bundle every single time though. If you want to automatically update the bundle in Firefox whenever you make a change, run this:

```
yarn watch
```

Now you can make code changes the bundle will be automatically built for you inside `firefox`, and you can simply run mochitests and edit code as much as you like.

If you see an `ENOENT` error when running either of these commands, like below:

```
{ Error: ENOENT: no such file or directory, open '/path/to/debugger.html/firefox/devtools/client/jar.mn'
    at Object.fs.openSync (fs.js:646:18)
    at Object.fs.readFileSync (fs.js:551:33)
    at updateFile (/path/to/debugger.html/bin/copy-assets.js:29:17)
    at copySVGs (/path/to/debugger.html/bin/copy-assets.js:102:3)
    at start (/path/to/debugger.html/bin/copy-assets.js:225:3)
    at module.exports (/path/to/debugger.html/bin/copy-assets.js:319:12)
    at start (/path/to/debugger.html/bin/copy.js:23:13)
    at Object.<anonymous> (/path/to/debugger.html/bin/copy.js:50:1)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/path/to/debugger.html/firefox/devtools/client/jar.mn' }
```

It may be that you have not cloned the latest `mozilla-central` repository, or it does not exist at the path you've provided. You can clone the latest `mozilla-central` by running the following command:

```
./bin/prepare-mochitests-dev
```

## Adding New Tests

If you add new tests, make sure to list them in the `browser.ini` file. You will see the other tests there. Add a new entry with the same format as the others. You can also add new JS or HTML files by listing in under `support-files`.

## API

In addition to the standard Mochitest API, we provide the following functions to help write tests. All of these expect a `dbg` context which is returned from `initDebugger` which should be called at the beginning of the test. An example skeleton test looks like this:

```js
add_task(function*() {
  const dbg = yield initDebugger("doc_simple.html", "code_simple.js");
  // do some stuff
  ok(state.foo, "Foo is OK");
});
```

The Debugger Mochitest API Documentation can be found [here](https://devtools-html.github.io/debugger.html/reference#mochitest).

[head]: https://github.com/devtools-html/debugger.html/blob/master/src/test/mochitest/head.js
[mochitests]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
[waiting]: https://github.com/devtools-html/debugger.html/commit/7b4762d9333108b15d81bc41e12182370c81e81c
[server-oops]: https://github.com/devtools-html/debugger.html/commit/7e54e6b46181b747a828ab2dc1db96c88313db95#diff-4fb7729ef51f162ae50b7c3bc020a1e3
[pretty-printing]: https://github.com/devtools-html/debugger.html/commit/6a66ce54faf8239fb358462c53c022a75615aae6#diff-a81153d2e92178917a135261f4245c39R12
[local-config]: https://github.com/devtools-html/debugger.html/blob/master/docs/local-development.md#logging

## Troubleshooting Test Harness
If symbolic link is suddenly lost between debugger.html and Firefox source, in your terminal, try the following

1. Navigate to the firefox directory (i.e. `cd ~/debugger.html/firefox`)
2. Execute `./mach mochitest --headless devtools/client/debugger/new`

  If a symbolic link occurs, error message(s) will be displayed.

  ![Test harness with symbolic link errors](http://i40.photobucket.com/albums/e250/md2k6/Public/Opensource/debugger-html-6297/mochitest-error_zpsgicbau0z.jpg)

3. Execute `./bin/prepare-mochitests-dev`.

Running this command again allows the preparation script to check the integrity of the firefox directory and all symbolic
links. It will then automatically execute `yarn copy` on your behalf, which ensures the symbolic linking process
is complete.

4. On a new terminal tab, execute the command to run your test again. If this failed, proceed to step 5.

5.  Execute `./mach configure`

This will attempt to fix the harness' configurations.

### Missing Rust compiler
If you are having issues running mochitest due to missing the Rust compiler, try the following:

1. In the root directory of the project (i.e. `debugger.html/`), execute `./mach configure`.

2. Execute `yarn watch`

3. Open a new terminal tab and run your tests again. If this failed, proceed to step 4 and 5.

4. Execute `./mach bootstrap`.

5. Execute `./bin/prepare-mochitests-dev`.

  You may see warnings along the way and the process may
appear to be frozen. Please be patient, this is expected as it will take a while to recompile. Warning messages does not mean the compilation process has failed.

6. Repeat steps 2 and 3.
