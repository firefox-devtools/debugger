### April 4th

This week we landed some nice features and had help from new contributors.

* **Blackboxing** - we landed an MVP version this week!
* **ES6** - we got lots of great help converting our code to ES6 modules and classes! Special shout out to [@peterschussheim], [@Erica42], and [@wldcordeiro] for their help!
* **Preview** - [@ryanjduffy] helped make preview inert on out of scope code
* **client** - we moved the firefox and chrome API back into the debugger!

[@jasonLaster], [@irfanhudda], [@Erica42], [@wldcordeiro], [@clarkbw], [@jeffpape], [@willr], [@jacobjzhang], [@NikoLewis], [@jryans], [@bomsy], [@ruturajv], [@DanUgelow], [@peterschussheim], [@ryanjduffy], [@kristoforusrp], [@AlanCezarAraujo], [@gabrielluong]

#### UI

* [Polish updateSearchResults][pr-12] - [@jasonLaster]
* [Hiding Expressions][pr-17] - [@bomsy]
* [Merge Class search into variables list][pr-20] - [@ruturajv]
* [SearchBar - Fix cursor for disabled search modifier][pr-21] - [@irfanhudda]
* [Add search modifier tooltips][pr-30] - [@DanUgelow]
* [Fix vertical footer][pr-34] - [@jasonLaster]
* [FunctionSearch - Not updating selected item on click][pr-38] - [@AlanCezarAraujo]
* [Fix NaN bug when toggling function search][pr-13] - [@jacobjzhang]

#### Blackboxing

We built an MVP blackboxing solution this week that supports black boxing sources and hiding frames from that file. Some of the UI highlights are:

* improved blackbox badge in the footer
* the editor UI shows the source with the source breakpoints hidden
* the editor context menus only shows "unblackbox sources"

[(WIP) Add Blackbox][pr-41] - [@jasonLaster]

#### Source Outline

Gabriel started working on a source outline view, which will show a sources functions in the left sidebar. We hope this will help users find the function they want to debug a little faster.

[Add initial source outline][pr-42] - [@gabrielluong]

#### Preview

Have you ever noticed that you could hover over random variables while paused and see a popup preview?  [Ryan][@ryanjduffy] added a fantastic feature to preview to first check if a variable was in the paused scope before showing the preview popup.

[Prevent previewing tokens out of scope of the selected frame][pr-33] - [@ryanjduffy]

#### Infrastructure
* [remove the extra husky dependency][pr-14] - [@clarkbw]
* [Update Gecko in CI Docker image to include devtools-source-map v0.3.0][pr-16] - [@jryans]
* [Fix worker test failures][pr-18] - [@jasonLaster]
* [Upgrade yarn and docs][pr-19] - [@clarkbw]
* [Use source map service from toolbox in Firefox][pr-22] - [@jryans]
* [Fix source maps][pr-24] - [@jasonLaster]
* [Add pull request documentation link][pr-28] - [@DanUgelow]
* [Tiny text fix][pr-39] - [@bomsy]
* [Use Devtools Splitter][pr-40] - [@jasonLaster]


#### Cleanup

* [Refactor editor][pr-6] - [@jasonLaster]
* [(WIP) Add client to debugger][pr-11] - [@jasonLaster]
* [improve readibility of readme][pr-15] - [@NikoLewis]
* [Fix up Docker mapping to use latest files again][pr-25] - [@jryans]
* [Standardize prettier options][pr-26] - [@jryans]
* [Fix mochitests - add testing vars][pr-27] - [@jasonLaster]

#### Prettier improvements

* [Fix the tests][pr-29] - [@jasonLaster]
* [tweak script][pr-36] - [@jasonLaster]
* [Fix arguments][pr-37] - [@jasonLaster]

#### ES6

* [ResultList and Accordion][pr-1] - [@irfanhudda]
* [Expressions][pr-2] - [@Erica42]
* [Convert actions][pr-3] - [@wldcordeiro]
* [Shared/menu][pr-4] - [@clarkbw]
* [Fix ES6 actions imports][pr-5] - [@wldcordeiro]
* [updated file to es module][pr-7] - [@jeffpape]
* [Rep][pr-8] - [@willr]
* [Event listeners reducer][pr-9] - [@Erica42]
* [SearchInput][pr-31] - [@irfanhudda]
* [Editor/Breakpoint][pr-32] - [@peterschussheim]
* [Footer.js][pr-35] - [@kristoforusrp]
* [followup tweaks][pr-23] - [@jasonLaster]


[pr-0]:https://github.com/firefox-devtools/debugger/pull/2479
[pr-1]:https://github.com/firefox-devtools/debugger/pull/2477
[pr-2]:https://github.com/firefox-devtools/debugger/pull/2482
[pr-3]:https://github.com/firefox-devtools/debugger/pull/2481
[pr-4]:https://github.com/firefox-devtools/debugger/pull/2469
[pr-5]:https://github.com/firefox-devtools/debugger/pull/2483
[pr-6]:https://github.com/firefox-devtools/debugger/pull/2428
[pr-7]:https://github.com/firefox-devtools/debugger/pull/2472
[pr-8]:https://github.com/firefox-devtools/debugger/pull/2474
[pr-9]:https://github.com/firefox-devtools/debugger/pull/2473
[pr-10]:https://github.com/firefox-devtools/debugger/pull/2480
[pr-11]:https://github.com/firefox-devtools/debugger/pull/2478
[pr-12]:https://github.com/firefox-devtools/debugger/pull/2488
[pr-13]:https://github.com/firefox-devtools/debugger/pull/2484
[pr-14]:https://github.com/firefox-devtools/debugger/pull/2502
[pr-15]:https://github.com/firefox-devtools/debugger/pull/2494
[pr-16]:https://github.com/firefox-devtools/debugger/pull/2495
[pr-17]:https://github.com/firefox-devtools/debugger/pull/2453
[pr-18]:https://github.com/firefox-devtools/debugger/pull/2504
[pr-19]:https://github.com/firefox-devtools/debugger/pull/2501
[pr-20]:https://github.com/firefox-devtools/debugger/pull/2486
[pr-21]:https://github.com/firefox-devtools/debugger/pull/2461
[pr-22]:https://github.com/firefox-devtools/debugger/pull/2506
[pr-23]:https://github.com/firefox-devtools/debugger/pull/2510
[pr-24]:https://github.com/firefox-devtools/debugger/pull/2515
[pr-25]:https://github.com/firefox-devtools/debugger/pull/2507
[pr-26]:https://github.com/firefox-devtools/debugger/pull/2512
[pr-27]:https://github.com/firefox-devtools/debugger/pull/2508
[pr-28]:https://github.com/firefox-devtools/debugger/pull/2517
[pr-29]:https://github.com/firefox-devtools/debugger/pull/2505
[pr-30]:https://github.com/firefox-devtools/debugger/pull/2516
[pr-31]:https://github.com/firefox-devtools/debugger/pull/2522
[pr-32]:https://github.com/firefox-devtools/debugger/pull/2520
[pr-33]:https://github.com/firefox-devtools/debugger/pull/2530
[pr-34]:https://github.com/firefox-devtools/debugger/pull/2535
[pr-35]:https://github.com/firefox-devtools/debugger/pull/2519
[pr-36]:https://github.com/firefox-devtools/debugger/pull/2531
[pr-37]:https://github.com/firefox-devtools/debugger/pull/2541
[pr-38]:https://github.com/firefox-devtools/debugger/pull/2524
[pr-39]:https://github.com/firefox-devtools/debugger/pull/2538
[pr-40]:https://github.com/firefox-devtools/debugger/pull/2521
[pr-41]:https://github.com/firefox-devtools/debugger/pull/2523
[pr-42]:https://github.com/firefox-devtools/debugger/pull/2544
[@jasonLaster]:http://github.com/jasonLaster
[@irfanhudda]:http://github.com/irfanhudda
[@Erica42]:http://github.com/Erica42
[@wldcordeiro]:http://github.com/wldcordeiro
[@clarkbw]:http://github.com/clarkbw
[@jeffpape]:http://github.com/jeffpape
[@willr]:http://github.com/willr
[@jacobjzhang]:http://github.com/jacobjzhang
[@NikoLewis]:http://github.com/NikoLewis
[@jryans]:http://github.com/jryans
[@bomsy]:http://github.com/bomsy
[@ruturajv]:http://github.com/ruturajv
[@DanUgelow]:http://github.com/DanUgelow
[@peterschussheim]:http://github.com/peterschussheim
[@ryanjduffy]:http://github.com/ryanjduffy
[@kristoforusrp]:http://github.com/kristoforusrp
[@AlanCezarAraujo]:http://github.com/AlanCezarAraujo
[@gabrielluong]:http://github.com/gabrielluong
