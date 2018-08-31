# Spider Monkey

* [Building Spider Monkey](#building-spider-monkey)
* [JIT Tests](#jit-tests)
* [Debugger API](#debugger-api)

[SpiderMonkey][sm] is Mozilla's JavaScript engine written in C and C++. The Debugger server uses its
API to do everything from setting breakpoints to receiving pause events.

[sm]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey

### Building Spider Monkey

It's fairly easy to build the engine and get started. The MDN [docs][install] have a detailed installation guide, but here is a quick version:

**Quick Version:**

Set your [mozconfig][config] to this:

```
mk_add_options MOZ_OBJDIR=./objdir-frontend
mk_add_options MOZ_MAKE_FLAGS="-j6 -s"
```

Then move into the `js/src` directory, start building the shell and get a :coffee:.

```bash
cd <gecko>/js/src
autoconf-2.13

# This name should end with "_OPT.OBJ" to make the version control system ignore it.
mkdir build_OPT.OBJ
cd build_OPT.OBJ
../configure --enable-debug --disable-optimize

# Use "mozmake" on Windows
make
```

When it is done, you can run the shell and start hacking!

```
./js/src/js
```

### JS Shell

The shell is useful for inspecting engine-level debug information. The mdn [docs][shell] list all of the commands.

One useful command is `dis`, which disassembles the JavaScript bytecode. This is useful for seeing the offsets for individual bytecode instructions and determining where a breakpoint will be set, or what will happen when a program steps.

```
➜  build_OPT.OBJ ./js/src/js
js> dis("f()")
loc     op
-----   --
main:
00000:  getgname "f"                    # f
00005:  gimplicitthis "f"               # f THIS
00010:  call 0                          # f(...)
00013:  setrval                         #
00014:  retrval                         #

Source notes:
 ofs line    pc  delta desc     args
---- ---- ----- ------ -------- ------
  0:    1    14 [  14] xdelta
  1:    1    14 [   0] colspan 3
```

[config]: https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Configuring_Build_Options
[install]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Build_Documentation
[shell]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Introduction_to_the_JavaScript_shell

## JIT Tests

Once you've built the JS Shell, you can begin running the JIT Tests. These are pure gold:

1.  they're written in JS
2.  they document the Debugger's API

Examples:

| Test                         | Description                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------ |
| [Frame-onStep-01][onstep1]   | Test that onStep fires often enough to see all four values of a.               |
| [breakpoint-01][bp1]         | Basic breakpoint test.                                                         |
| [breakpoint-resume-01][res1] | A breakpoint handler hit method can return {throw: exc} to throw an exception. |

[bp1]: https://searchfox.org/mozilla-central/source/js/src/jit-test/tests/debug/breakpoint-01.js
[onstep1]: https://searchfox.org/mozilla-central/source/js/src/jit-test/tests/debug/Frame-onStep-01.js
[res1]: https://searchfox.org/mozilla-central/source/js/src/jit-test/tests/debug/breakpoint-resume-01.js

Lets take a look at one test [breakpoint-01][bp1] and see what it is doing

```js
var g = newGlobal();
var dbg = Debugger(g);

dbg.onDebuggerStatement = function(frame) {
  g.s += "0";
  var line0 = frame.script.getOffsetLocation(frame.offset).lineNumber;
  var offs = frame.script.getLineOffsets(line0 + 2);
  for (var i = 0; i < offs.length; i++)
    frame.script.setBreakpoint(offs[i], {
      hit: frame => {
        g.s += "1";
      }
    });
};

g.s = "";
g.eval(
  "debugger;\n" +
  "s += 'a';\n" + // line0 + 1
    "s += 'b';\n"
); // line0 + 2
assertEq(g.s, "0a1b");
```

The first thing it does is set up a new global and debugger `g` and `dbg`.
Almost every test starts this way

```js
var g = newGlobal();
var dbg = Debugger(g);
```

The next thing it does is set an `onDebuggerStatement` callback.
This is a convenient way to pause early in the test and have a script we can do stuff with. In this example, the test gets the 2nd line's bytecode offsets and sets a breakpoint for each offset.
Remember, we **are** testing breakpoints here :)

```js
dbg.onDebuggerStatement = function(frame) {
  g.s = "0";
  var line0 = frame.script.getOffsetLocation(frame.offset).lineNumber;
  var offs = frame.script.getLineOffsets(line0 + 2);
  for (var i = 0; i < offs.length; i++)
    frame.script.setBreakpoint(offs[i], {
      hit: frame => {
        g.s += "1";
      }
    });
};
```

Next, we invoke `g.eval` with a small program. Most tests have an eval because it is the easiest way to run something.

```js
g.s = "";
g.eval(
  "debugger;\n" +
  "s += 'a';\n" + // line0 + 1
    "s += 'b';\n"
); // line0 + 2
```

If this program runs without pausing, then at the end, `s` will have the value `ab`;
because we set an `onDebuggerStatement`, however,  interesting things will happen:

1.  when the debugger statement is hit, `s` will become '0'
2.  when the next statement is invoked, `s` will become '0a'
3.  when the breakpoint on the second line is hit, `s` becomes '0a1'
4.  when the statement completes, `s` becomes '0a1b'.

When everything is done, will finally check the value of `s`!

```js
assertEq(g.s, "0a1b");
```

And now we know that the breakpoint is hit!

### Debugger API

If you're interested in seeing how the [Debugger API][api] is implemented,
the best place to start is is [debugger.cpp][debugger.cpp]. From there, you will find other files like [EnvironmentObject.cpp][environment.cpp] which implements `Debugger.Environment`.

Pro Tips:

* The header files are a great overview
* There are a lot of concepts, but the MDN [docs][js-api] are fantastic. e.g. [rooted][rooted]
* Reach out early on Slack! This is a crazy codebase, we'd love to help you get started.

[api]: https://developer.mozilla.org/en-US/docs/Tools/Debugger-API
[debugger.cpp]: https://searchfox.org/mozilla-central/source/js/src/vm/Debugger.cpp
[environment.cpp]: https://searchfox.org/mozilla-central/source/js/src/vm/EnvironmentObject.cpp
[rooted]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/JSAPI_reference/JS::Rooted
[js-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/JSAPI_reference
