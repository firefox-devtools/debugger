### May 2nd Update

This week was a really exciting week for both new feature and general quality improvements.

We started working on some really nice features

* :bullettrain_front: Column Breakpoints
* :spaghetti: Framework Frames
* :speech_balloon: Watch Expressions
* :spaghetti: Copy Call Stack

We also made a lot of progress on

* :kissing_heart: converting to ES6. Big thanks to [@peterschussheim]
* 🤡 Adding component unit tests [@AnshulMalik] [@mbarzeev]
* :chart_with_upwards_trend: Improving our render performance [@asolove]

Thanks to everyone who helped us this week [@assafdd], [@amitzur] [@virzen], [@clarkbw], [@irfanhudda], [@asolove], [@ruturajv], [@fujifish], [@AnshulMalik], [@roieu], [@peterschussheim], [@andreicristianpetcu], [@mbarzeev], [@adamki], [@sharathnarayanph], [@zivkaziv], [@bomsy]

#### UI

* [Adding to watch Expressions, commented mouseLeave][pr-9] - [@ruturajv]
* [Blackbox source icon][pr-12] - [@roieu]
* [adds hover styles and tooltips to search arrow buttons][pr-20] - [@adamki]
* [Fix toggle pane in RTL][pr-24] - [@sharathnarayanph]
* [Copy stack trace to clipboard][pr-25] - [@zivkaziv]

##### Column Breakpoints

[Column breakpoints][pr-23] is very early on. This prototype adds the
support for adding column breakpoints in our redux store and showing them
in the editor. We still want to style the markers, add some AST validation,
and work on the general UX. Big thanks to [@assafdd] [@amitzur] who helped with
the prototype.

#### Framework Frames

[Framework Frames][pr-30] groups the framework frames so that you can easily
see the application code and when you're interested view the framework frames
as well.

#### Bug Fixes
* [Return on null AST][pr-5] - [@jasonLaster]
* [Fix Outline CPU usage (and unrelated test failure)][pr-8] - [@asolove]
* [Fix broken source search][pr-11] - [@AnshulMalik]
* [fixes broken ui][pr-26] - [@bomsy]

#### ES6 + Refactoring

* [Convert remaining of reducers to ES modules][pr-3] - [@virzen]
* [Convert sources reducer to ES modules][pr-7] - [@virzen]
* [Convert components to ES modules][pr-13] - [@peterschussheim]
* [Convert shared components to es6 modules][pr-16] - [@peterschussheim]
* [Refactored components][pr-19] - [@AnshulMalik]
* [remove editor preview feature flag][pr-10] - [@fujifish]
* [remove feature flag for symbol search][pr-14] - [@fujifish]
* [removed feature flag for Watch Expressions #2678][pr-17] - [@andreicristianpetcu]
* [removed feature flag for search modifiers #2685][pr-21] - [@andreicristianpetcu]
* [Convert to ES modules][pr-27] - [@peterschussheim]
* [(WIP) Refactor to es modules][pr-28] - [@peterschussheim]

#### Docs
* [Update docs for remotely debuggable browsers][pr-4] - [@clarkbw]
* [changelog podcast][pr-29] - [@jasonLaster]

#### Tests
* [Add jest test for ResultList][pr-15] - [@AnshulMalik]
* [Preview function unit tests][pr-18] - [@mbarzeev]
* [Add a test for changing the selected frame][pr-22] - [@jasonLaster]
* [Re-Added Storybook for Editor Tabs][pr-31] [@jasonLaster]

#### Infrastructure
* [Remove L10N setup from utils/tests/scopes.js][pr-6] - [@irfanhudda]

----

##### Watch Expressions

![watch]

##### Column Breakpoints

It still needs some styling work and AST validation, but how cool is that!

![column]

##### Framework Frames

![frames]


##### Blackbox Icon

![blackbox]

##### Storybook

![storybook]

[watch]:https://cloud.githubusercontent.com/assets/254562/25305897/a418302a-2751-11e7-83ba-83e0b6e13798.png
[blackbox]:https://cloud.githubusercontent.com/assets/4980440/25448489/4e01f4c8-2ac1-11e7-8ca9-704fb37e374a.png
[column]:https://cloud.githubusercontent.com/assets/254562/25475857/318c1bf8-2b06-11e7-9e10-96ed6549aa03.png
[frames]:https://camo.githubusercontent.com/00eeea03c674a65e9e55b11f9e6a15a8fbf1bef2/687474703a2f2f672e7265636f726469742e636f2f767662786457515130422e676966
[storybook]:https://camo.githubusercontent.com/742899a7255d7bfd0f02a860b1aaac78d54c6fbf/687474703a2f2f672e7265636f726469742e636f2f6b76435a50447135636b2e676966


[pr-0]:https://github.com/firefox-devtools/debugger/pull/2732
[pr-1]:https://github.com/firefox-devtools/debugger/pull/2737
[pr-2]:https://github.com/firefox-devtools/debugger/pull/2734
[pr-3]:https://github.com/firefox-devtools/debugger/pull/2739
[pr-4]:https://github.com/firefox-devtools/debugger/pull/2740
[pr-5]:https://github.com/firefox-devtools/debugger/pull/2725
[pr-6]:https://github.com/firefox-devtools/debugger/pull/2733
[pr-7]:https://github.com/firefox-devtools/debugger/pull/2736
[pr-8]:https://github.com/firefox-devtools/debugger/pull/2738
[pr-9]:https://github.com/firefox-devtools/debugger/pull/2713
[pr-10]:https://github.com/firefox-devtools/debugger/pull/2749
[pr-11]:https://github.com/firefox-devtools/debugger/pull/2748
[pr-12]:https://github.com/firefox-devtools/debugger/pull/2751
[pr-13]:https://github.com/firefox-devtools/debugger/pull/2754
[pr-14]:https://github.com/firefox-devtools/debugger/pull/2752
[pr-15]:https://github.com/firefox-devtools/debugger/pull/2750
[pr-16]:https://github.com/firefox-devtools/debugger/pull/2741
[pr-17]:https://github.com/firefox-devtools/debugger/pull/2762
[pr-18]:https://github.com/firefox-devtools/debugger/pull/2756
[pr-19]:https://github.com/firefox-devtools/debugger/pull/2755
[pr-20]:https://github.com/firefox-devtools/debugger/pull/2757
[pr-21]:https://github.com/firefox-devtools/debugger/pull/2761
[pr-22]:https://github.com/firefox-devtools/debugger/pull/2763
[pr-23]:https://github.com/firefox-devtools/debugger/pull/2760
[pr-24]:https://github.com/firefox-devtools/debugger/pull/2770
[pr-25]:https://github.com/firefox-devtools/debugger/pull/2759
[pr-26]:https://github.com/firefox-devtools/debugger/pull/2779
[pr-27]:https://github.com/firefox-devtools/debugger/pull/2777
[pr-28]:https://github.com/firefox-devtools/debugger/pull/2765
[pr-29]:https://github.com/firefox-devtools/debugger/pull/2768
[pr-30]:https://github.com/firefox-devtools/debugger/pull/2774
[pr-31]:https://github.com/firefox-devtools/debugger/pull/2776

[@assafdd]:https://github.com/assafdd
[@amitzur]:https://github.com//amitzur
[@jasonLaster]:http://github.com/jasonLaster
[@virzen]:http://github.com/virzen
[@clarkbw]:http://github.com/clarkbw
[@irfanhudda]:http://github.com/irfanhudda
[@asolove]:http://github.com/asolove
[@ruturajv]:http://github.com/ruturajv
[@fujifish]:http://github.com/fujifish
[@AnshulMalik]:http://github.com/AnshulMalik
[@roieu]:http://github.com/roieu
[@peterschussheim]:http://github.com/peterschussheim
[@andreicristianpetcu]:http://github.com/andreicristianpetcu
[@mbarzeev]:http://github.com/mbarzeev
[@adamki]:http://github.com/adamki
[@sharathnarayanph]:http://github.com/sharathnarayanph
[@zivkaziv]:http://github.com/zivkaziv
[@bomsy]:http://github.com/bomsy
