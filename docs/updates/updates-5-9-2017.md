### May 9th, 2017

* [Adam][@asolove] dramatically improved our startup performance. [pr][pr-6]
* [Ryan][@ryanjduffy] completed the heroic and insane project of getting babel working with HTML inline JS. [pr][pr-23]
* We landed framework call stack toggling. [pr][pr-1]
* [Diéssica][@diessica] jumped in and polished our Tabs UI
* We started converting our Prop Types to Flow Props. Thanks [Mateusz][@Andarist] and others for the help kicking this off!
* We added several new Jest component tests. Big thanks to [Andrei][@andreicristianpetcu] for tackling async component updates. It was not an easy task!
* We re-added storybook this week and wrote our first stories for Frames and Tabs! The stories are also being tested on CI with the great [percy.io](http://percy.io).

Big thanks to everyone who helped this week [@adamki], [@asolove], [@irfanhudda], [@clarkbw], [@andreicristianpetcu], [@sharathnarayanph], [@Andarist], [@zacanger], [@DanUgelow], [@ryanjduffy], [@bomsy], [@diessica], [@Sequoia], [@AgtLucas]

#### UI

* [Add Frame Toggling][pr-1] - [@jasonLaster]
* [Add right border to command bar in rtl mode][pr-11] - [@irfanhudda]
* [hide folding in the panel][pr-15] - [@jasonLaster]
* [Fix symbol search shortcut][pr-16] - [@jasonLaster]
* [Add key modifiers to shortcut values][pr-18] - [@sharathnarayanph]
* [Fix the Windows key issues][pr-20] - [@jasonLaster]
* [Improve source tree and search results][pr-28] - [@diessica]
* [Fix secondary pane toggle button in vertical mode][pr-29] - [@diessica]
* [Format Reference Errors][pr-33] - [@sharathnarayanph]

#### Performance

* [Add reselect and reduce unnecessary renders][pr-6] - [@asolove]
* [Fix tabs reselect][pr-8] - [@jasonLaster]
* [SourceFooter to extend PureComponent instead of Component][pr-12] - [@clarkbw]
* [Redux performance user timing middleware][pr-25] - [@clarkbw]
* [More performance improvements][pr-27] - [@asolove]


#### Bug Fixing

* [Remove expand actor caching][pr-24] - [@bomsy]
* [Previewing values in editor when paused][pr-26] - [@asolove]


#### Flow Typing
* [Switch Footer from PropTypes to flow props][pr-13] - [@clarkbw]
* [Converted PropTypes to flow types in EventListeners.js][pr-19] - [@Andarist]
* [Use Flow instead of PropTypes in Breakpoint and ColumnBreakpoint.][pr-21] - [@zacanger]
* [Converted PropTypes to flow types in SearchBar.js][pr-30] - [@Andarist]
* [Convert propTypes to Flow Props][pr-34] - [@AgtLucas]


#### Preview

We use Babel's parser in the client to statically analyze our JS.
This works really well for us, but presents the problem of how we will parse
our inline JS. Ryan wrote a great library for extracting the JS from our html files [here](https://github.com/ryanjduffy/parse-script-tags). The test in the PR says it all.

* [Add parser support for HTML files][pr-23] - [@ryanjduffy]

#### Testing

* [Re-add storybook][pr-4] - [@jasonLaster]
* [Add percy snapshot testing][pr-14] - [@jasonLaster]
* [Add jest test for Outline][pr-17] - [@andreicristianpetcu]
* [Add stories for Frames][pr-36] - [@jasonLaster]

#### infrastructure

* [removes showSource feature-flag remnants][pr-0] - [@adamki]
* [Drop version number][pr-2] - [@jasonLaster]
* [Add 5-2 weekly update][pr-3] - [@jasonLaster]
* [bump lp][pr-5] - [@jasonLaster]
* [Fix snapshot][pr-7] - [@jasonLaster]
* [bump to launchpad 76][pr-9] - [@jasonLaster]
* [backport bz patch][pr-10] - [@jasonLaster]
* [update the properties][pr-31] - [@jasonLaster]
* [fix keyshortcut labels][pr-35] - [@jasonLaster]

#### Docs

* [add error section to dev doc][pr-22] - [@DanUgelow]
* [Remove extraneous note on node.js setup][pr-32] - [@Sequoia]


#### Storybook

![tabs](https://camo.githubusercontent.com/742899a7255d7bfd0f02a860b1aaac78d54c6fbf/687474703a2f2f672e7265636f726469742e636f2f6b76435a50447135636b2e676966)

![frames](https://camo.githubusercontent.com/50bc8493ff3dfeafc6652a4620ac1dd2c05e9791/687474703a2f2f672e7265636f726469742e636f2f747063303952794f6f552e676966)

#### Framework frames

![frames](https://camo.githubusercontent.com/00eeea03c674a65e9e55b11f9e6a15a8fbf1bef2/687474703a2f2f672e7265636f726469742e636f2f767662786457515130422e676966)

#### Tab UI polish

![tab-fixes](https://cloud.githubusercontent.com/assets/5303585/25777111/8f275250-32a9-11e7-931c-89b438eabae9.png)

#### Toggle UI Polish

![toggle](https://cloud.githubusercontent.com/assets/5303585/25778251/53503398-32cf-11e7-9664-a346fbb599b5.gif)

#### Format Watch Expression errors

![](https://cloud.githubusercontent.com/assets/16179366/25773629/4945144c-3246-11e7-92d2-7cccac19b28b.png)


[pr-0]:https://github.com/firefox-devtools/debugger/pull/2766
[pr-1]:https://github.com/firefox-devtools/debugger/pull/2774
[pr-2]:https://github.com/firefox-devtools/debugger/pull/2789
[pr-3]:https://github.com/firefox-devtools/debugger/pull/2783
[pr-4]:https://github.com/firefox-devtools/debugger/pull/2776
[pr-5]:https://github.com/firefox-devtools/debugger/pull/2803
[pr-6]:https://github.com/firefox-devtools/debugger/pull/2784
[pr-7]:https://github.com/firefox-devtools/debugger/pull/2795
[pr-8]:https://github.com/firefox-devtools/debugger/pull/2799
[pr-9]:https://github.com/firefox-devtools/debugger/pull/2793
[pr-10]:https://github.com/firefox-devtools/debugger/pull/2802
[pr-11]:https://github.com/firefox-devtools/debugger/pull/2798
[pr-12]:https://github.com/firefox-devtools/debugger/pull/2816
[pr-13]:https://github.com/firefox-devtools/debugger/pull/2805
[pr-14]:https://github.com/firefox-devtools/debugger/pull/2811
[pr-15]:https://github.com/firefox-devtools/debugger/pull/2807
[pr-16]:https://github.com/firefox-devtools/debugger/pull/2821
[pr-17]:https://github.com/firefox-devtools/debugger/pull/2815
[pr-18]:https://github.com/firefox-devtools/debugger/pull/2819
[pr-19]:https://github.com/firefox-devtools/debugger/pull/2830
[pr-20]:https://github.com/firefox-devtools/debugger/pull/2820
[pr-21]:https://github.com/firefox-devtools/debugger/pull/2823
[pr-22]:https://github.com/firefox-devtools/debugger/pull/2824
[pr-23]:https://github.com/firefox-devtools/debugger/pull/2810
[pr-24]:https://github.com/firefox-devtools/debugger/pull/2826
[pr-25]:https://github.com/firefox-devtools/debugger/pull/2825
[pr-26]:https://github.com/firefox-devtools/debugger/pull/2818
[pr-27]:https://github.com/firefox-devtools/debugger/pull/2828
[pr-28]:https://github.com/firefox-devtools/debugger/pull/2836
[pr-29]:https://github.com/firefox-devtools/debugger/pull/2837
[pr-30]:https://github.com/firefox-devtools/debugger/pull/2831
[pr-31]:https://github.com/firefox-devtools/debugger/pull/2845
[pr-32]:https://github.com/firefox-devtools/debugger/pull/2847
[pr-33]:https://github.com/firefox-devtools/debugger/pull/2833
[pr-34]:https://github.com/firefox-devtools/debugger/pull/2842
[pr-35]:https://github.com/firefox-devtools/debugger/pull/2846
[pr-36]:https://github.com/firefox-devtools/debugger/pull/2839

[@adamki]:http://github.com/adamki
[@jasonLaster]:http://github.com/jasonLaster
[@asolove]:http://github.com/asolove
[@irfanhudda]:http://github.com/irfanhudda
[@clarkbw]:http://github.com/clarkbw
[@andreicristianpetcu]:http://github.com/andreicristianpetcu
[@sharathnarayanph]:http://github.com/sharathnarayanph
[@Andarist]:http://github.com/Andarist
[@zacanger]:http://github.com/zacanger
[@DanUgelow]:http://github.com/DanUgelow
[@ryanjduffy]:http://github.com/ryanjduffy
[@bomsy]:http://github.com/bomsy
[@diessica]:http://github.com/diessica
[@Sequoia]:http://github.com/Sequoia
[@AgtLucas]:http://github.com/AgtLucas
