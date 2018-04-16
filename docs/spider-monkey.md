# Spider Monkey

[SpiderMonkey][sm] is Mozilla's JavaScript engine written in C and C++. The Debugger server uses its
API to do everything from setting breakpoints to receiving pause events.

[sm]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey

## JS Shell

### Install

It's fairly easy to install js shell once you have the appropriate dependencies. The MDN [docs][install] have a detailed installation guide.

**Quick Version:**

```bash
cd <gecko>/js/src
autoconf-2.13

# This name should end with "_OPT.OBJ" to make the version control system ignore it.
mkdir build_OPT.OBJ
cd build_OPT.OBJ
../configure --enable-debug --disable-optimize
# Use "mozmake" on Windows
make


# Run the shell
./js/src/js
```

#### Pro Tips

One way to speed up the builds is to add `mk_add_options MOZ_MAKE_FLAGS="-j6 -s"` to your [mozconfig][config] file.

[config]: https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Configuring_Build_Options
[install]: https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Build_Documentation

## JIT Tests

NOTE: First you have to build the JS Shell

```diff
diff --git a/js/src/jit-test/tests/debug/wasm-11.js b/js/src/jit-test/tests/debug/wasm-11.js
index 6c84c1c..1da17f2 100644
--- a/js/src/jit-test/tests/debug/wasm-11.js
+++ b/js/src/jit-test/tests/debug/wasm-11.js
@@ -11,6 +11,8 @@ g.eval(`
     var dbg = new Debugger(parent);
 `);

+console.log("YO")
+
 var i = new WebAssembly.Instance(new WebAssembly.Module(wasmTextToBinary(`
     (module
         (func (export "f2")
```

```
cd <gecko>/js/src/jit-test
./jit_test.py --no-progress -o ../build_DBG.OBJ/dist/bin/js wasm-11

Exit code: 0
YO
Exit code: 0
PASSED ALL
```
