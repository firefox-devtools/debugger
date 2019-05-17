## Releasing + Bundling the Debugger

### What is a release?

Releasing the Debugger to MC is the process of landing a new version of the Debugger in MC.
It is basically automating the steps :)

1.  checkout the latest release branch
2.  create a new branch off of it and cherry-pick new commits from master
3.  go to firefox repo and create a new branch off of mozilla/central
4.  create a new bug in the debugger component for the release
5.  run `yarn copy --mc <path to firefox>` to copy the files and assets to mc
6.  go to firefox and commit the changes with the title `Bug <ID> - Update Debugger Frontend v<relaease #> r=<reviewer>`
7.  go back to the debugger and commit the `assets-manifest` and push the branch `g push --set-upstream origin -f --no-verify release-<Release Number>`

### Investigating a performance regression

When we notice that a release caused a performance regression in talos, it is important to be able to identify the specific commit(s) that caused the regression. The easiest way to do so is to use try + talos to bisect the commits in the release and find the regression.

1. create a spreadsheet with the commits in the release e.g. [release 91][sheet]
2. go to the spreadsheet and identify commits that are possible performance regressions
3. checkout the release commit in firefox and trigger a try run `./mach try -b o -p linux64,win64 -u none -t damp-e10s --rebuild-talos 6`
4. checkout the prior release commit in firefox and trigger a try run so there is a baseline for comparison
5. choose a couple of commits in the release then bisect the release so that when you have talos results you'll have a better idea of when the problem was introduced.
6. for each candidate commit
   - checkout the commit in github
   - run `yarn copy --mc <path to firefox>`
   - firefox commit the changes
   - run `try` with talos `./mach try -b o -p linux64,win64 -u none -t damp-e10s --rebuild-talos 6`
   - add the try url to the sheet in a separate column
7. when the try runs are complete
   - go to [try chooser][try] and select a base and new revision. The revision is in the try URLs you saved in the sheet. NOTE:
     the project should be `try` and you'll need to select _compare specific revision_.
   - click compare, select the platform you want to compare, and the view the the improvements and regressions for each test.

*Note: A handy way to get the commit listing text to copy into the spreadsheet:*

```js
$$('.commit').map(e => [
    e.querySelector('.commit-message').innerText, 
    e.querySelector('.commit-id').href
]).map(r => r.join('\t'))
```

[sheet]: https://docs.google.com/spreadsheets/d/1yEkT0lk2UVI7tsfZpNH2yo8ajZQsLs6gyW9gGOoaTDk/edit#gid=0
[try]: https://treeherder.mozilla.org/perf.html#/comparechooser?newProject=try&newRevision=5c850420b5a08ef14d9c52e0f76648168b2d9a88

### What is in a bundle

The simplest way to see the size of the bundle,
and which packages are taking up space is to look at the webpack visualizer.

1.  `vis=true node bin/copy-assets.js --mc ../gecko --assets`
2.  `cd ../gecko/devtools/client/debugger`
3.  `open webpack-stats.html`

![][vis]

### Why are packages included in the bundle?

When you see that a package is included that you feel should not be in the bundle,
you can open the WebPack Analyzer and look.

1.  go to [analyzer](http://webpack.github.io/analyse)
2.  select open find the latest stats.json output `<debugger>/webpack-stats/stats-<sha>.json`

The analyzer is a bit complicated, so here are some things to look for:

1.  **assets/chunks** - what chunk number is each asset. The `debugger` is often chunk `0`
2.  **modules** - Which modules appear. Which modules are the largest. Note, you are often looking at just the modules for chunk **0**
3.  **module** - What are the _reasons_ the module was imported. What are the _dependencies_ of the module. It is often useful to start at a large module, see who imported it, until you find the user code.

Notes:

1.  When modules like `react` are excluded, they show up as `external ...` with a small byte size
2.  `user-request` is a good way to see what the first request was. For instance `prop-types` resulted in `./node_modules/prop-types/index.js`

![][ana]

---

![][ana2]

[ana]: https://shipusercontent.com/05ace0ec040dc7af3067cb50b528d717/Screen%20Shot%202017-11-08%20at%209.42.07%20AM.png
[vis]: https://shipusercontent.com/d00336549a3b754be1d6669c1dee2fd7/Screen%20Shot%202017-11-08%20at%209.41.09%20AM.png
[ana2]: https://shipusercontent.com/5eddfde393466f225e402f7d0226b1d1/Screen%20Shot%202017-11-08%20at%204.03.23%20PM.png
