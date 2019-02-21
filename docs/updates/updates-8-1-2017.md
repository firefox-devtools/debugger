### August 1st

This week was the last week before the debugger goes to dev edition. Huge thanks to everyone who chipped in and fixed a bug or polished a rough edge.

[@bomsy], [@yurydelendik], [@Garbee], [@wldcordeiro], [@darkwing], [@irfanhudda], [@jasonLaster], [@codehag],


#### UI

This week again we focused on polish, making the ui look more consistent, and smaller fixes rather than large features. We had some great progress on the behavior of the SymbolModal (Thanks [@wldcordeiro]!), Expressions. This has put us in a really good spot, and we are looking forward to continuing to improve the UI

Symbol Modal: [animated-modal]

* [Scroll onload][pr-0] - [@jasonLaster]
* [[SourceSearch] Improve not-found UI][pr-31] - [@codehag]
* [[Expressions] Items should be of same height][pr-32] - [@irfanhudda]
* [Remove button hover color if button is disabled][pr-33] - [@darkwing]
* [Watch Expression the remove button is often hidden by the scroll bar][pr-12] - [@codehag]
* [FileSearch does not update match count][pr-6] - [@codehag]
* [Animate the SymbolModal's entrance/exit][pr-18] - [@wldcordeiro]

#### Dark Theme Tweaks
Dark Theme Tweaks: [dark-theme-tweaks]

* [Style popup shadows][pr-23] - [@jasonLaster]
* [Dark theme tweaks][pr-28] - [@jasonLaster]

#### Bug Fixes

This was the final week before the release for 65 and we fixed lots of presentational bugs.

[@Garbee] fixed a bug where the command bar would start scrolling even though it was position sticky. In the process he added a test case to the CSS spec issue filed against the sticky property. We also fixed bugs with almost every component: call stack, source tree, editor, codemirror.

* [Breakpoints disappear on sourcemapped sources][pr-2] - [@codehag]
* [Fix framework grouping when toggling states][pr-7] [2][pr-4] - [@jasonLaster]
* [Fix test error: client.sourceContents is not a function][pr-13] - [@codehag]
* [Fix commandbar scrolling issue ][pr-14] - [@Garbee]
* [Fix source editor scroll to line][pr-5] - [@jasonLaster]
* [Do not set source.isWasm attribute for old Firefox.][pr-11] - [@yurydelendik]
* [Fix breakpoint toggling][pr-26] - [@jasonLaster]
* [Editor instance is unavailable after editor change][pr-10] - [@jasonLaster]
* [Clear expressions when the debugger resumes][pr-21] - [@jasonLaster]
* [Show conditional breakpoint panels on the correct line][pr-17] - [@jasonLaster]
* [Fix searching when the file has long lines][pr-19] - [@codehag]
* [Support complex file trees][pr-24] - [@jasonLaster]


#### Project Search

[@bomsy] did some amazing work in getting project search ready to go. Lots of improvements and ui fixes. We should be able to land this in the next milestone!

Keyboard access: [keyboard-access]

* [cleanups and fixes][pr-9] - [@bomsy]
* [flashing the line that the text was found on][pr-20] - [@bomsy]
* [Keyboard access][pr-25] - [@bomsy]

#### Infrastructure

* [Add a longer timeout for the reloading test][pr-22] - [@jasonLaster]
* [Prevent width value warning error in outline stories][pr-29] - [@darkwing]
* [MC Releases][pr-1] [2][pr-3] [3][pr-15] [4][pr-27] - [@jasonLaster]
* [weekly updates][pr-8] - [@jasonLaster]
* [bump prefs schema][pr-16] - [@jasonLaster]
* [Add stub 'closeActiveSearch' so Tabs stories don't error out][pr-30] - [@darkwing]
* [Fix race condition with project text search tests][pr-34] - [@jasonLaster]

---



[pr-0]:https://github.com/firefox-devtools/debugger/pull/3431
[pr-1]:https://github.com/firefox-devtools/debugger/pull/3445
[pr-2]:https://github.com/firefox-devtools/debugger/pull/3440
[pr-3]:https://github.com/firefox-devtools/debugger/pull/3438
[pr-4]:https://github.com/firefox-devtools/debugger/pull/3443
[pr-5]:https://github.com/firefox-devtools/debugger/pull/3437
[pr-6]:https://github.com/firefox-devtools/debugger/pull/3442
[pr-7]:https://github.com/firefox-devtools/debugger/pull/3434
[pr-8]:https://github.com/firefox-devtools/debugger/pull/3446
[pr-9]:https://github.com/firefox-devtools/debugger/pull/3452
[pr-10]:https://github.com/firefox-devtools/debugger/pull/3454
[pr-11]:https://github.com/firefox-devtools/debugger/pull/3412
[pr-12]:https://github.com/firefox-devtools/debugger/pull/3465
[pr-13]:https://github.com/firefox-devtools/debugger/pull/3472
[pr-14]:https://github.com/firefox-devtools/debugger/pull/3466
[pr-15]:https://github.com/firefox-devtools/debugger/pull/3456
[pr-16]:https://github.com/firefox-devtools/debugger/pull/3455
[pr-17]:https://github.com/firefox-devtools/debugger/pull/3480
[pr-18]:https://github.com/firefox-devtools/debugger/pull/3415
[pr-19]:https://github.com/firefox-devtools/debugger/pull/3476
[pr-20]:https://github.com/firefox-devtools/debugger/pull/3492
[pr-21]:https://github.com/firefox-devtools/debugger/pull/3484
[pr-22]:https://github.com/firefox-devtools/debugger/pull/3494
[pr-23]:https://github.com/firefox-devtools/debugger/pull/3481
[pr-24]:https://github.com/firefox-devtools/debugger/pull/3477
[pr-25]:https://github.com/firefox-devtools/debugger/pull/3502
[pr-26]:https://github.com/firefox-devtools/debugger/pull/3498
[pr-27]:https://github.com/firefox-devtools/debugger/pull/3499
[pr-28]:https://github.com/firefox-devtools/debugger/pull/3497
[pr-29]:https://github.com/firefox-devtools/debugger/pull/3513
[pr-30]:https://github.com/firefox-devtools/debugger/pull/3516
[pr-31]:https://github.com/firefox-devtools/debugger/pull/3473
[pr-32]:https://github.com/firefox-devtools/debugger/pull/3504
[pr-33]:https://github.com/firefox-devtools/debugger/pull/3515
[pr-34]:https://github.com/firefox-devtools/debugger/pull/3511
[@jasonLaster]:http://github.com/jasonLaster
[@codehag]:http://github.com/codehag
[@bomsy]:http://github.com/bomsy
[@yurydelendik]:http://github.com/yurydelendik
[@Garbee]:http://github.com/Garbee
[@wldcordeiro]:http://github.com/wldcordeiro
[@darkwing]:http://github.com/darkwing
[@irfanhudda]:http://github.com/irfanhudda

[animated-modal]:https://user-images.githubusercontent.com/580982/28493756-280fb992-6ed9-11e7-9b11-52ffc2f0c0f3.gif

[keyboard-access]:https://camo.githubusercontent.com/88a4ce075490296b577213c90ee8b112c00d7d1b/687474703a2f2f672e7265636f726469742e636f2f76737956527a615345692e676966


[dark-theme-tweaks]:https://user-images.githubusercontent.com/254562/28782138-4afa9942-75da-11e7-8f25-9c8c26fc6d52.png
