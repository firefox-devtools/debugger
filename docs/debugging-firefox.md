## Debugging Firefox

### Getting Started

1. *Get the code* `./bin/prepare-mochitests-dev`
2. *Go to the firefox directory* `cd firefox`
3. *Build Firefox* `./mach build` [see docs][mach]
4. *Run Firefox* `./mach run` [see docs][mach]

### Firefox Code Base

Firefox is a large project, but for the most part the relevant source code is in `/devtools`. The debugger client, is in `/devtools/client/debugger/new`.

#### Updating the Debugger

You can update the debugger by running `yarn copy-assets` or `yarn copy-assets-watch`. The script will use webpack to bundle the debugger and copy the bundle into `devtools/client/debugger/new/debugger.js`.

> Remember, every time the code changes in firefox you need to re-run `./mach build`!

#### Inspecting the Debugger in the Panel

Firefox has built the toolbox so that it is powerful enough to debug the Firefox. You can launch it with `./mach run --jsdebugger`. When you do, you're using the "browser toolbox" and you can inspect and debug anything in the browser, including the Debugger.

#### Debugging the Debugger Server

The server code lives in  `/devtools/server`. It can be a bit difficult to debug, so the best thing to do is to add *log* statements in the code with the special `dump` command e.g. `dump(">> I am here\n")`. When you do, you'll see the logs in the terminal and in the browser toolbox console.

[mach]: https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/mach
