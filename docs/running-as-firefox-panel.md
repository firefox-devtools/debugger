# Running as the firefox panel

* [Getting Started with Firefox Nightly](#getting-started-with-firefox-nightly)
  * [For Windows Developers](#for-windows-developers)
* [Configuring Firefox path in the debugger](#configuring-firefox-path-in-the-debugger)
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

## Configuring Firefox path in the debugger

You will need to copy your new debugger code into firefox each time you change something. By default
we have the location of firefox to be within the devtools directory.

However if you have firefox installed elsewhere you can update this in `configs/local.json`. There you will find a configuration
called

```json
{
  "firefox.mcPath": "./firefox" // expecting firefox to be under `debugger.html/firefox`
}
```

You can change this to what works for you!

## Running Nightly with the local debugger

Now we can put these pieces together. After you copy over the assets, you can run firefox with the
debugger inside the panel!

in debugger project (`projects/debugger.html` or wherever you have it!):
```
yarn copy-assets
```

in firefox project (`projects/firefox` or wherever you have it!):
```
./mach build faster && ./mach run
```

## Watching for Changes

On to the fun stuff. Each time you change something you will need to copy over your assets, you can
do this like so!

in yarn:
```
yarn copy-assets
```

That will build the debugger and copy over all the relevant files into `firefox`.

It's annoying to have to manually update the bundle every single time though. If you want to automatically update the bundle in Firefox whenever you make a change, run this:

```
yarn copy-assets-watch
```

Now you can make code changes the bundle will be automatically built for you inside `firefox`.


### Getting Help

There are lots of helpful folks who'd be happy to answer
your questions on [slack][slack].

[slack]:https://devtools-html-slack.herokuapp.com/
