## Releasing + Bundling the Debugger

### What is a release?

Releasing the Debugger to MC is the process of landing a new version of the Debugger in MC.
It is basically automating the steps :)

1. create a new up to date branch in MC and Github
2. create the bundle and commit the `assets-manifest` in GH and commit the bundle patch in MC.
3. check for changes in MC since the last bundle. If there have been any other changes, notify the user.
4. run the tests in MC, if they pass: create a new Bugzilla bug and append a patch and try run
5. if the tests fail or the patch is bad for any reason, automate the steps for updating the bug.

The automation steps are managed in the [ship2gecko][s2g] repo.

[s2g]: https://github.com/jasonLaster/ship2gecko


### What is a bundle and how do I make one?

Bundle generally speaking is the process of moving the code in github into MC.
It literally refers to *webpack* making a JS and CSS bundle for the Debugger
and a JS bundle for each of the workers. But, there are some other steps that are
needed in order to get the Debugger code into MC:

1. copy the debugger files: e.g. properties, prefs', index.html, panel, moz.build
2. copy assets like SVGs
3. copy mochitests

Here is the bundle [script](../bin/copy-assets.js).


### What packages make the bundle large?

The simplest way to see the size of the bundle,
and which packages are taking up space is to look at the webpack visualizer.

1. `vis=true node bin/copy-assets.js --mc ../gecko --assets`
2. `cd ../gecko/devtools/client/debugger/new`
3. `open webpack-stats.html`

![][vis]

### Why are packages included in the bundle?

When you see that a package is included that you feel should not be in the bundle,
you can open the WebPack Analyzer and look.


1. go to [analyzer](http://webpack.github.io/analyse)
2. select open find the latest stats.json output `<debugger.html>/webpack-stats/stats-<sha>.json`

The analyzer is a bit complicated, so here are some things to look for:

1. **assets/chunks** - what chunk number is each asset. The `debugger` is often chunk `0`
2. **modules** - Which modules appear. Which modules are the largest. Note, you are often looking at just the modules for chunk **0**
3. **module** - What are the *reasons* the module was imported. What are the *dependencies* of the module. It is often useful to start at a large module, see who imported it, until you find the user code.

Notes:

1. When modules like `react` are excluded, they show up as `external ...` with a small byte size
2. `user-request` is a good way to see what the first request was. For instance `prop-types` resulted in `./node_modules/prop-types/index.js`

![][ana]

---

![][ana2]

[ana]: https://shipusercontent.com/05ace0ec040dc7af3067cb50b528d717/Screen%20Shot%202017-11-08%20at%209.42.07%20AM.png
[vis]: https://shipusercontent.com/d00336549a3b754be1d6669c1dee2fd7/Screen%20Shot%202017-11-08%20at%209.41.09%20AM.png
[ana2]: https://shipusercontent.com/5eddfde393466f225e402f7d0226b1d1/Screen%20Shot%202017-11-08%20at%204.03.23%20PM.png
