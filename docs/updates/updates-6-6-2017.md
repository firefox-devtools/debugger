### June 6th

This was a really great week for QA improvements as the debugger is getting more stable each week.

* We now disable out of scope lines when the debugger pauses.
* We have huge updates to preview - it's faster, more consistent, and works for HTML elements
* Breakpoints are kept in sync as code changes. Big thanks to [@codehag]
* We're chipping away at two new features: Outline View and Project Search

Thanks to everyone who helped out [@bomsy], [@irfanhudda], [@peterschussheim], [@amelzer], [@codehag]

#### UI

* [Disable active line][pr-2] - [@jasonLaster]
* [fix annoying expression duplicate keys warning][pr-5] - [@bomsy]
* [Fix input font size][pr-6] - [@jasonLaster]
* [[Frames] Show collapse row button when there are more than NUM_FRAMES_SHOWN frames][pr-7] - [@irfanhudda]
* [cleanup source tree][pr-11] - [@jasonLaster]

#### Out Of Scope Locations

We are now disabling the code that's out of scope when you pause. This is a really nice win for users because it is more clear what code they should look at. It also means that other code is not a minefield for popups. We can prevent preview popups when they hover over other code.

* [Highlight Lines V1][pr-0] - [@jasonLaster]

#### Preview

Preview got a lot of love last week.
We fixed a bug where HTML elements were not being previewed. We also, refactored the way we get the preview, which makes it significantly faster and more robust. And we tidied up how promises were shown and the alignment of keys!

* [Refactor Preview][pr-1] - [@jasonLaster]
* [Vertically align variable keys when inspecting objects][pr-8] - [@peterschussheim]
* [Fix DOM event properties not showing up in the OI][pr-4] - [@bomsy]
* [Promise fixes][pr-3] - [@jasonLaster]


#### Outline View

[Anna][@amelzer] helped us add outline view tabs for toggling between sources and outline view.
[PR][pr-9]

![](https://cloud.githubusercontent.com/assets/1628866/26779038/217584e6-49e4-11e7-9545-0b225594af56.gif)


#### Project Search

We started working on project text search, which is one of the major parity features missing today. [PR][pr-10] - [@jasonLaster]

#### Breakpoints

We fixed a bug where if you were debugging your app which used source maps,
you would pause in random places when you changed your code. This happened because the debugger server stored breakpoints in
bundle (generated) locations and the client kept them in (mapped locations) original. [bug][pr-12] - [@codehag]

#### Refactor

* [[WIP] consolidate source text][pr-13] - [@jasonLaster]

#### Infrastructure

* [bump percy][pr-14] - [@jasonLaster]

---

#### HTML Elements are previewed :)

![](https://cloud.githubusercontent.com/assets/792924/26710979/4d08d27a-4755-11e7-8722-43f578ce6651.png)


[pr-0]:https://github.com/firefox-devtools/debugger/pull/3051
[pr-1]:https://github.com/firefox-devtools/debugger/pull/3057
[pr-2]:https://github.com/firefox-devtools/debugger/pull/3067
[pr-3]:https://github.com/firefox-devtools/debugger/pull/3064
[pr-4]:https://github.com/firefox-devtools/debugger/pull/3061
[pr-5]:https://github.com/firefox-devtools/debugger/pull/3060
[pr-6]:https://github.com/firefox-devtools/debugger/pull/3065
[pr-7]:https://github.com/firefox-devtools/debugger/pull/3077
[pr-8]:https://github.com/firefox-devtools/debugger/pull/3079
[pr-9]:https://github.com/firefox-devtools/debugger/pull/3087
[pr-10]:https://github.com/firefox-devtools/debugger/pull/3089
[pr-11]:https://github.com/firefox-devtools/debugger/pull/3082
[pr-12]:https://github.com/firefox-devtools/debugger/pull/3039
[pr-13]:https://github.com/firefox-devtools/debugger/pull/3081
[pr-14]:https://github.com/firefox-devtools/debugger/pull/3086
[@jasonLaster]:http://github.com/jasonLaster
[@bomsy]:http://github.com/bomsy
[@irfanhudda]:http://github.com/irfanhudda
[@peterschussheim]:http://github.com/peterschussheim
[@amelzer]:http://github.com/amelzer
[@codehag]:http://github.com/codehag
