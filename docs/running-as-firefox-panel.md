# Running as the firefox panel

* [Getting Started with Firefox Nightly](#getting-started-with-firefox-nightly)
  * [For Windows Developers](#for-windows-developers)
* [Running Nightly with the local debugger](#running-nightly-with-the-local-debugger)
* [Watching for Changes](#watching-for-changes)
* [Getting Help](#getting-help)

## Getting Started with Firefox Nightly

Running Firefox is similar to running [Mochitests](./mochitests.md) (our integration tests)

**Requirements**

* mercurial ( `brew install mercurial` )
* autoconf213 ( `brew install autoconf@2.13 && brew unlink autoconf` )

On the first run, this will download a local copy of Firefox and set up an [artifact build](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Artifact_builds) (just think of a super fast Firefox build). It may take a while (10-15 minutes) to download and build Firefox.

There are two commands that you will need. `./mach build` and `./mach run` these can be run together
each time things change with `./mach build && ./mach run`

If you update your Firefox build infrequently, you may need to [Clobber the
tree](https://wiki.mozilla.org/Clobbering_the_Tree)

* The first time you run the project you will need to use `./mach build` but after the first run you can use `./mach build faster`! The full command looks like this`./mach build faster && ./mach run` (for more info about this take a look at the [mach docs](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/mach)

You should now have a fresh copy of nightly open up! You can pass a few properties to it as well,
such as -P <custom-profile> if you want to use a specific profile

### For Windows Developers

The detailed instructions for setting up your environment to build Firefox for Windows can be found [here](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Build_Instructions/Windows_Prerequisites). You need to install the latest `MozBuild` package. You can open a unix-flavor shell by starting:

```
C:\mozilla-build\start-shell.bat
```

In the shell, navigate to the debugger.html project folder, and follow the Getting Started instructions as mentioned.

## Running Nightly with the local debugger

Now we can put these pieces together.

in debugger project (`projects/debugger.html` or wherever you have it!):

```
node ./bin/copy --mc <path to firefox>
```

in firefox project (`projects/firefox` or wherever you have it!):

```
./mach build faster && ./mach run
```

## Watching for Changes

If you would like to quickly make changes in github and update the files in MC automatically,
you can run `copy` with the `--watch` option.

```
node ./bin/copy --watch --mc <path to firefox>
```

Now you can make code changes the bundle will be automatically built for you inside `firefox`.

### Getting Help

There are lots of helpful folks who'd be happy to answer
your questions on [slack][slack].

[slack]: https://devtools-html-slack.herokuapp.com/
