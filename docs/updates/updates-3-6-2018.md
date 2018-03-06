## March 6th, 2018

tl;dr

1.  Performance - bundle sizes are 30% smaller, ast traversals are 2x faster.
2.  Stability - fixed two pausing related crashes!
3.  Preview - better support for typescript, flow,
4.  Frameworks - babel call stack grouping
5.  Original Scopes
6.  Bug Fixes - windows keyboard shortcuts are getting better!
7.  UI Polish - so much goodness
8.  Time Travel - check out the video!

Big Thanks to everyone who helped out this week [@DavideDeCenzo], [@lukaszsobek], [@AnshulMalik], [@Bilie], [@calebstdenis], [@atwalg2], [@bomsy], [@loganfsmyth], [@berraknil], [@nyrosmith], [@lauragift21], [@zeoneo]

### Performance

This week we did four things that will really help with the debugger's performance

1.  we upgraded to React 16.2 in the launchpad [PR][5465] [@AnshulMalik]
2.  we switched to using Immutable records for sources. This will let us avoid unnecessary `.toJS` calls and it will let us drop `.get` calls which will let us play with other immutable implementations. [PR][5389] [@davidedecenzo]
3.  We switched to a much faster ast traversal function which doubled our performance for getting source symbols. [PR][5572] [@jasonlaster]
4.  We reduced the bundle sizes by 30-40%. Big thanks to [@loganfsmyth] and [@juliandescottes]
5.  We tried loading lodash with `importScripts`, but found that the loading times were slower than parsing. [PR][5608] [@juliandescottes]

### Stability

One of our two goals for 61 is to improve the debugger stability for core use cases.
This past week we looked into fixing two issues with stepping:

1.  A debugger crash when there is a debugger statement at the top of an original file [PR][5490] [@codehag]
2.  A debugger crash when navigating away from a page when the debugger is paused and has watch expressions [PR][5524] [@jasonLaster]

### Preview

This past week we excluded two spots in the code from previewing. This will prevent unnecessary `undefined` values. We also added support for typescript mode in codemirror so the syntax highlighting will be better. This will really help previewing because we don't support previewing strings.

* [Exclude flow annotations from symbol identifiers][5486] [@AnshulMalik]
* [Should ignore some labels][5531] [@atwalg2]
* [[Parser] Support typescript mode][5574] [@nyrosmith]

| Exclude Flow Annotations |
| ------------------------ |
| ![5486-0]                |

| Exclude Object Labels |
| --------------------- |
| ![5531-0]             |

### Frameworks

* We added support for grouping async babel stacks this week. This is the first time we've grouped frames by something other than frame url. The effect is that we can now do much more interesting groups like "Async" frames. [PR][5518] [@calebstdenis]
* We added support for recognizing Vue components. This means that vue files will have the vue icon in the tabs and source tree. [PR][5530] [@lukaszsobek]

| Group Babel Async Frames |
| ------------------------ |
| ![5518-2]                |

### Original Scopes

Logan is continue to make great progress on mapping original scopes. This past week he landed two features:

1.  the ability to map imported modules when webpack only provides line based mappings
2.  some fallback logic to show the generated scopes if the mapping missed 10% of the bindings

* [Add some fallback logic for original module scopes][5541] [@loganfsmyth]
* [Require original scope mapping to be 90% successful to be shown.][5549] [@loganfsmyth]

### Bug Fixes

* [fix tabs using the selected source][5535] [@bomsy]
* [[Search] - Prevent multiple search boxes from opening on Windows][5569] [@darkwing]

### UI Polish

* [Removes sad face when source+goto][5444] [@lukaszsobek]
* [Provide a method for Alphabetizing the outline functions and classes][5501] [@darkwing]
* [Display message to indicate no selected source in Outline tab (#5266)][5506] [@Bilie]
* [Highlight original source for sources tree][5511] [@darkwing]
* [Restores result count for Project Search][5536] [@lukaszsobek]
* [Give command bar buttons full background on hover][5548] [@berraknil]
* [Update Breakpoints state only once when "Toggle all breakpoints"][5567] [@nyrosmith]
* [Fix css variable][5577] [@lauragift21]
* [Watch expression hover background color][5591] [@zeoneo]
* [Change shortcuts modal cursor to default for consistency][5612] [@darkwing]

| Alphabetize Button In the Outline View |
| -------------------------------------- |
| ![5501-0]                              |

### Time Travel

The Time Travel technology is getting better every day. You can now download a version of firefox where you can try it out [link](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/WebReplay).

This week we tweaked the time travel UI to improve stepping and jumping back in time.

* The step buttons are now grouped into 3 categories (resume/rewind, step back/forward, and step in / out)
* Jumping now support going forward and back to new lines

[PR][5601] [@jasonLaster]

[video](https://youtu.be/YRKsYc6jCg4)

### Infrastructure

* [Update eslint-plugin-mozilla to the latest version 🚀][5503]
* [Bump launchpad][5542] [@jasonLaster]
* [Bump node engine][5610] [@jasonLaster]
* [Prepush][5611] [@jasonLaster]

### Docs

* [(WIP) 2-27 doc update][5547] [@jasonLaster]
* [Improve Issue triaging process][5580] [@jasonLaster]

### Testing

* [Clean up the stepping tests][5551] [@jasonLaster]
* [Fixup conditional bp test][5555] [@jasonLaster]
* [Bump Mochitest][5556] [@jasonLaster]
* [Fixup Conditional Beakpoint panel test][5562] [@jasonLaster]
* [Re-Enable babel-stepping test with the appropriate step positions][5594] [@jasonLaster]
* [Update timeout in browser_dbg-babel.js (sync m-c bug 1440102)][5604] [@juliandescottes]

### Code Health

* [Bump dependencies][5560] [@jasonLaster]
* [Replace bind.this with fat arrow functions][5571] [@nyrosmith]
* [Revert commits][5575] [@jasonLaster]
* [Get rid of prop-types][5579] [@nyrosmith]
* [Revert using Flow to type context][5599] [@nyrosmith]
* [Fix warning about PureComponent & shouldComponentUpdate][5600] [@nyrosmith]
* [Backport - Bug 1248498 - Check document cache status when loading HTM…][5606] [@jasonLaster]
* [Backport - Bug 1424154 - Disable test on WinCCOV - Intermittent /brow…][5607] [@jasonLaster]

[5444-0]: https://user-images.githubusercontent.com/23530054/36551637-5d77725a-17f8-11e8-8907-6a0564421e71.gif
[5486-0]: https://user-images.githubusercontent.com/7821757/36467741-1ebec1fa-1706-11e8-80c7-ebc7be26c6db.gif
[5501-0]: https://user-images.githubusercontent.com/46655/36518031-5a3fc352-174a-11e8-91e7-601c939b28ff.png
[5518-0]: https://user-images.githubusercontent.com/7321311/36616406-a40163a2-18b1-11e8-8d3f-cef044e7884a.gif
[5518-1]: https://user-images.githubusercontent.com/7321311/36800857-8562c8a2-1c7e-11e8-89ba-b147c64c8510.png
[5518-2]: https://user-images.githubusercontent.com/7321311/36925581-890136e6-1e41-11e8-8df3-e10b4eda9142.png
[5531-0]: https://user-images.githubusercontent.com/23143862/36647331-182cad6e-1a41-11e8-8282-794cd09a18d2.gif
[5536-0]: https://user-images.githubusercontent.com/23530054/36688593-36053f4e-1b2d-11e8-8b41-336fd3eab571.gif
[5548-0]: https://user-images.githubusercontent.com/6593585/36753552-869488a8-1c17-11e8-8f12-68ed72345acd.gif
[5572-0]: https://user-images.githubusercontent.com/254562/36863585-18f6f898-1d58-11e8-8428-4ef4b1d44d78.png
[5572-1]: https://user-images.githubusercontent.com/254562/36863581-176fb71c-1d58-11e8-9e3b-2a6dfa6fd758.png
[5591-0]: https://user-images.githubusercontent.com/26451940/36920188-e3e5d6e0-1e85-11e8-9abe-76fad5c94d8d.gif
[5601-0]: https://user-images.githubusercontent.com/254562/36946872-cd3b195c-1f91-11e8-8428-41c331aa22a0.png
[5601-1]: https://user-images.githubusercontent.com/254562/36946870-c9c8f6a4-1f91-11e8-8f20-b7cc915fbd55.png
[5389]: https://github.com/devtools-html/debugger.html/pull/5389
[5444]: https://github.com/devtools-html/debugger.html/pull/5444
[5465]: https://github.com/devtools-html/debugger.html/pull/5465
[5486]: https://github.com/devtools-html/debugger.html/pull/5486
[5490]: https://github.com/devtools-html/debugger.html/pull/5490
[5501]: https://github.com/devtools-html/debugger.html/pull/5501
[5503]: https://github.com/devtools-html/debugger.html/pull/5503
[5506]: https://github.com/devtools-html/debugger.html/pull/5506
[5511]: https://github.com/devtools-html/debugger.html/pull/5511
[5518]: https://github.com/devtools-html/debugger.html/pull/5518
[5524]: https://github.com/devtools-html/debugger.html/pull/5524
[5530]: https://github.com/devtools-html/debugger.html/pull/5530
[5531]: https://github.com/devtools-html/debugger.html/pull/5531
[5535]: https://github.com/devtools-html/debugger.html/pull/5535
[5536]: https://github.com/devtools-html/debugger.html/pull/5536
[5541]: https://github.com/devtools-html/debugger.html/pull/5541
[5542]: https://github.com/devtools-html/debugger.html/pull/5542
[5547]: https://github.com/devtools-html/debugger.html/pull/5547
[5548]: https://github.com/devtools-html/debugger.html/pull/5548
[5549]: https://github.com/devtools-html/debugger.html/pull/5549
[5551]: https://github.com/devtools-html/debugger.html/pull/5551
[5555]: https://github.com/devtools-html/debugger.html/pull/5555
[5556]: https://github.com/devtools-html/debugger.html/pull/5556
[5560]: https://github.com/devtools-html/debugger.html/pull/5560
[5562]: https://github.com/devtools-html/debugger.html/pull/5562
[5567]: https://github.com/devtools-html/debugger.html/pull/5567
[5569]: https://github.com/devtools-html/debugger.html/pull/5569
[5571]: https://github.com/devtools-html/debugger.html/pull/5571
[5572]: https://github.com/devtools-html/debugger.html/pull/5572
[5575]: https://github.com/devtools-html/debugger.html/pull/5575
[5576]: https://github.com/devtools-html/debugger.html/pull/5576
[5577]: https://github.com/devtools-html/debugger.html/pull/5577
[5579]: https://github.com/devtools-html/debugger.html/pull/5579
[5580]: https://github.com/devtools-html/debugger.html/pull/5580
[5591]: https://github.com/devtools-html/debugger.html/pull/5591
[5593]: https://github.com/devtools-html/debugger.html/pull/5593
[5594]: https://github.com/devtools-html/debugger.html/pull/5594
[5599]: https://github.com/devtools-html/debugger.html/pull/5599
[5600]: https://github.com/devtools-html/debugger.html/pull/5600
[5601]: https://github.com/devtools-html/debugger.html/pull/5601
[5604]: https://github.com/devtools-html/debugger.html/pull/5604
[5606]: https://github.com/devtools-html/debugger.html/pull/5606
[5607]: https://github.com/devtools-html/debugger.html/pull/5607
[5608]: https://github.com/devtools-html/debugger.html/pull/5608
[5610]: https://github.com/devtools-html/debugger.html/pull/5610
[5611]: https://github.com/devtools-html/debugger.html/pull/5611
[5612]: https://github.com/devtools-html/debugger.html/pull/5612
[5574]: https://github.com/devtools-html/debugger.html/pull/5574
[@davidedecenzo]: https://github.com/DavideDeCenzo
[@lukaszsobek]: https://github.com/lukaszsobek
[@anshulmalik]: https://github.com/AnshulMalik
[@codehag]: https://github.com/codehag
[@darkwing]: https://github.com/darkwing
[@bilie]: https://github.com/Bilie
[@calebstdenis]: https://github.com/calebstdenis
[@jasonlaster]: https://github.com/jasonLaster
[@atwalg2]: https://github.com/atwalg2
[@bomsy]: https://github.com/bomsy
[@loganfsmyth]: https://github.com/loganfsmyth
[@berraknil]: https://github.com/berraknil
[@nyrosmith]: https://github.com/nyrosmith
[@juliandescottes]: https://github.com/juliandescottes
[@lauragift21]: https://github.com/lauragift21
[@zeoneo]: https://github.com/zeoneo
