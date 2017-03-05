### February 28th

#### Overview

Last week was nothing short or epic. 

1. We made tons of progress on function search, text search, and editor preview 
2. We squashed mountains of UI and perf bugs 
3. We added great features to the scopes pane
4. We focused on integration testing and general QA.

There's no way we could have gotten this done without the help of many people: [@rrandom], [@arthur801031], [@bomsy], [@wldcordeiro], [@jryans], [@irfanhudda], [@soapdog], [@amitzur], [@juliandescottes], [@Garbee], [@zystvan], [@najamkhn], [@jcreighton], [@jbhoosreddy], [@tromey], [@ryanjduffy], [@sole], [@lasfin]!

#### UI

We fixed UI bugs ranging from themes, to accessibility, to RTL. It was an unbelievable team effort.

* [Fix tab close button positioning][pr-12] - [@wldcordeiro]
* [Issue 1946: adding Conditional Breakpoint guillemet][pr-19] - [@soapdog]
* [Restore tooltips for debug buttons][pr-20] - [@irfanhudda]
* [Expand source directories on click][pr-23] - [@wldcordeiro]
* [Make the command bar sticky.][pr-35] - [@Garbee]
* [Align Text Vertically in Watch Expressions Panel Section][pr-36] - [@zystvan]
* [fix frame location color change on hover][pr-43] - [@jcreighton]
* [use scrollIntoView to improve result scrolling (#2106)][pr-44] - [@jbhoosreddy]
* [Refactor Searching UI into smaller components and clean up function search UI][pr-45] - [@wldcordeiro]
* [Add close button to conditional breakpoint panel][pr-49] - [@ryanjduffy]
* [Style the searchbar height so the result list doesn't go on forever][pr-52] - [@wldcordeiro]
* [Fix icons dark theme][pr-54] - [@jcreighton]
* [add chrome scrolling polyfill][pr-59] - [@jasonLaster]
* [(Accessibility) select frame on enter][pr-66] - [@lasfin]
* [Polish ui catchall][pr-67] - [@jasonLaster]
* [refactor why-paused component to use a react class and props][pr-9] - [@jasonLaster]


#### Bug Fixes

Thanks [@juliandescottes], [@bomsy], [@irfanhudda] for coming in and fixing some pretty embarressing bugs!

* [Fix source navigation, when switching from vertical to horizontal layouunlink][pr-32] - [@juliandescottes]
* [Fix watch expression editing][pr-28] - [@bomsy]
* [Address perf issues with source maps][pr-42] - [@jasonLaster]
* [Fix sources highlight][pr-53] - [@irfanhudda]
* [Speed up opening the editor][pr-68] - [@jasonLaster]

#### Text Search

Text search `cmd+f` is a surprisingly challenging feature that we've been working on since September.
This week, we nailed down some of the most complicated behavior around iterating through results, especially when cursor state changes.

* [Improve text search result count][pr-0] - [@rrandom]
* [EditorSearch index fix][pr-11] - [@jasonLaster]
* [Fix search selection][pr-13] - [@jasonLaster]
* [Add a search bottom bar and move the search modifiers to the bottom bar.][pr-21] - [@wldcordeiro]
* [Fix whole word search modifier clearing search and count showing as NaN][pr-63] - [@wldcordeiro]
* [Fix modifier buttons in chrome][pr-64] - [@wldcordeiro]
* [Don't run text search when function search is enabled.][pr-69] - [@wldcordeiro]

#### Function Search

Function Search was a stretch goal for our release going into the week.
Thanks to [babel.js](https://babeljs.io/) having a fantastic API and the heroic effort of [@clarkbw] and [@wldcordeiro]
on the UI we'll be able to launch a really beautiful feature.

* [use a unique id to show multiple matches in function search][pr-2] - [@clarkbw]
* [implement the function search compact design][pr-5] - [@clarkbw]
* [Update parser][pr-24] - [@jasonLaster]
* [Move the function search into the editor search bar][pr-27] [2][pr-30]  - [@wldcordeiro]
* [Disable the search modifiers when function search is enabled.][pr-60] - [@wldcordeiro]
* [Fix search results height in chrome.][pr-65] - [@wldcordeiro]
* [Polish search toggle UX][pr-70] - [@wldcordeiro]
* [Add summary messages for the function searching][pr-71] - [@wldcordeiro]

#### Scopes

The scopes component is one of the most used features of a Debugger and also introduces some of the most complexity.
This week we looked at showing promises, large arrrays, sparse arrays.
[@Bomsy] also tackled keeping variables expanded as the debugger steps through the code. This was a difficulty `hard` bug!

* [Persist scopes as you step][pr-6] - [@bomsy]
* [Add buckets for objects and keys][pr-22] - [@jasonLaster]
* [Show promises special properties (status, reason)][pr-51] - [@arthur801031]
* [Show falsey return values][pr-58] - [@tromey]

#### Editor Preview

Editor Preview is the one new **must** have feature of the release.
We were blocked on adding the feature, while we waited for parser support. This week we built a fantastic V1, which supports hovering on local variables and a really nice custom preview for functions and objects. In the case of functions, we also provide a link to the function definition.

* [Editor popover][pr-29] - [@amitzur]
* [Add Popup Preview (V1)][pr-40] - [@jasonLaster]
* [Preview objects, functions, and reps][pr-57] - [@jasonLaster]
* [Show editor preview on hover][pr-61] - [@bomsy]


#### Infrastructure

* [Add flow to Scopes.js, WhyPaused.js, SourcesTree.js,...][pr-1] - [@arthur801031]
* [fix the invalid source texts in the failing tests][pr-4] - [@bomsy]
* [add yarn run links script][pr-8] - [@clarkbw]
* [Add flow to Autocomplete.js, Close.js, PaneToggle.js,...][pr-10] - [@arthur801031]
* [update lint script to better capture directory layout][pr-14] - [@clarkbw]
* [Document Firefox WebSocket workflow][pr-15] - [@jryans]
* [Replace custom utilities with lodash utils where possible][pr-25] - [@clarkbw]
* [Fix the nom command to remove yarn.lock file][pr-41] - [@najamkhn]

#### Miscellaneous

* [cleanup l10n accesskey properties][pr-55] - [@jasonLaster]
* [Remove required status from  prop in searchbar and fix flow issues.][pr-48] - [@wldcordeiro]

#### Testing

* [add Tests for Return values][pr-33] - [@jasonLaster]
* [Additional integration tests][pr-18] - [@jasonLaster]
* [fix failing tests][pr-3] - [@jasonLaster]
* [Add Expressions test][pr-37] - [@bomsy]
* [fix console link test][pr-38] - [@jasonLaster]

#### Docs

* [(WIP) integration test docs][pr-16] - [@jasonLaster]
* [clean up testing docs][pr-34] - [@jasonLaster]
* [Add some maintainer docs][pr-47] - [@jasonLaster]

#### Screenshots

| Persist Scopes |
|----------------|
|![gif-1]|

| Editor Preview |
|----------------|
|![gif-2]|

| Text Search |
|-------------|
|![gif-3]!


[gif-1]:https://cloud.githubusercontent.com/assets/792924/23188424/948ff100-f886-11e6-9420-bab20d56d289.gif
[gif-2]:https://cloud.githubusercontent.com/assets/792924/23385436/b5e22ae2-fd47-11e6-9a55-e26365b3849e.gif
[gif-3]:https://camo.githubusercontent.com/c528900a4ca7a817e34cd43bd0d8a9f44c4c3a6e/687474703a2f2f672e7265636f726469742e636f2f494d385370645a784d722e676966

[pr-0]:https://github.com/devtools-html/debugger.html/pull/2005
[pr-1]:https://github.com/devtools-html/debugger.html/pull/2048
[pr-2]:https://github.com/devtools-html/debugger.html/pull/2058
[pr-3]:https://github.com/devtools-html/debugger.html/pull/2061
[pr-4]:https://github.com/devtools-html/debugger.html/pull/2062
[pr-5]:https://github.com/devtools-html/debugger.html/pull/2047
[pr-6]:https://github.com/devtools-html/debugger.html/pull/2064
[pr-7]:https://github.com/devtools-html/debugger.html/pull/2074
[pr-8]:https://github.com/devtools-html/debugger.html/pull/2073
[pr-9]:https://github.com/devtools-html/debugger.html/pull/2071
[pr-10]:https://github.com/devtools-html/debugger.html/pull/2069
[pr-11]:https://github.com/devtools-html/debugger.html/pull/2067
[pr-12]:https://github.com/devtools-html/debugger.html/pull/2043
[pr-13]:https://github.com/devtools-html/debugger.html/pull/2068
[pr-14]:https://github.com/devtools-html/debugger.html/pull/2086
[pr-15]:https://github.com/devtools-html/debugger.html/pull/2111
[pr-16]:https://github.com/devtools-html/debugger.html/pull/2095
[pr-17]:https://github.com/devtools-html/debugger.html/pull/2110
[pr-18]:https://github.com/devtools-html/debugger.html/pull/2089
[pr-19]:https://github.com/devtools-html/debugger.html/pull/2088
[pr-20]:https://github.com/devtools-html/debugger.html/pull/2099
[pr-21]:https://github.com/devtools-html/debugger.html/pull/2119
[pr-22]:https://github.com/devtools-html/debugger.html/pull/2026
[pr-23]:https://github.com/devtools-html/debugger.html/pull/2087
[pr-24]:https://github.com/devtools-html/debugger.html/pull/2092
[pr-25]:https://github.com/devtools-html/debugger.html/pull/2114
[pr-26]:https://github.com/devtools-html/debugger.html/pull/2063
[pr-27]:https://github.com/devtools-html/debugger.html/pull/2121
[pr-28]:https://github.com/devtools-html/debugger.html/pull/2118
[pr-29]:https://github.com/devtools-html/debugger.html/pull/2090
[pr-30]:https://github.com/devtools-html/debugger.html/pull/2139
[pr-31]:https://github.com/devtools-html/debugger.html/pull/2138
[pr-32]:https://github.com/devtools-html/debugger.html/pull/2129
[pr-33]:https://github.com/devtools-html/debugger.html/pull/2133
[pr-34]:https://github.com/devtools-html/debugger.html/pull/2136
[pr-35]:https://github.com/devtools-html/debugger.html/pull/2128
[pr-36]:https://github.com/devtools-html/debugger.html/pull/2142
[pr-37]:https://github.com/devtools-html/debugger.html/pull/2145
[pr-38]:https://github.com/devtools-html/debugger.html/pull/2147
[pr-39]:https://github.com/devtools-html/debugger.html/pull/2168
[pr-40]:https://github.com/devtools-html/debugger.html/pull/2153
[pr-41]:https://github.com/devtools-html/debugger.html/pull/2152
[pr-42]:https://github.com/devtools-html/debugger.html/pull/2140
[pr-43]:https://github.com/devtools-html/debugger.html/pull/2155
[pr-44]:https://github.com/devtools-html/debugger.html/pull/2166
[pr-45]:https://github.com/devtools-html/debugger.html/pull/2150
[pr-46]:https://github.com/devtools-html/debugger.html/pull/2183
[pr-47]:https://github.com/devtools-html/debugger.html/pull/2181
[pr-48]:https://github.com/devtools-html/debugger.html/pull/2188
[pr-49]:https://github.com/devtools-html/debugger.html/pull/2179
[pr-50]:https://github.com/devtools-html/debugger.html/pull/2189
[pr-51]:https://github.com/devtools-html/debugger.html/pull/2146
[pr-52]:https://github.com/devtools-html/debugger.html/pull/2170
[pr-53]:https://github.com/devtools-html/debugger.html/pull/2176
[pr-54]:https://github.com/devtools-html/debugger.html/pull/2174
[pr-55]:https://github.com/devtools-html/debugger.html/pull/2162
[pr-56]:https://github.com/devtools-html/debugger.html/pull/2212
[pr-57]:https://github.com/devtools-html/debugger.html/pull/2187
[pr-58]:https://github.com/devtools-html/debugger.html/pull/2216
[pr-59]:https://github.com/devtools-html/debugger.html/pull/2202
[pr-60]:https://github.com/devtools-html/debugger.html/pull/2198
[pr-61]:https://github.com/devtools-html/debugger.html/pull/2191
[pr-62]:https://github.com/devtools-html/debugger.html/pull/2201
[pr-63]:https://github.com/devtools-html/debugger.html/pull/2200
[pr-64]:https://github.com/devtools-html/debugger.html/pull/2197
[pr-65]:https://github.com/devtools-html/debugger.html/pull/2210
[pr-66]:https://github.com/devtools-html/debugger.html/pull/2182
[pr-67]:https://github.com/devtools-html/debugger.html/pull/2209
[pr-68]:https://github.com/devtools-html/debugger.html/pull/2190
[pr-69]:https://github.com/devtools-html/debugger.html/pull/2192
[pr-70]:https://github.com/devtools-html/debugger.html/pull/2211
[pr-71]:https://github.com/devtools-html/debugger.html/pull/2194
[@rrandom]:http://github.com/rrandom
[@arthur801031]:http://github.com/arthur801031
[@clarkbw]:http://github.com/clarkbw
[@jasonLaster]:http://github.com/jasonLaster
[@bomsy]:http://github.com/bomsy
[@wldcordeiro]:http://github.com/wldcordeiro
[@jryans]:http://github.com/jryans
[@irfanhudda]:http://github.com/irfanhudda
[@soapdog]:http://github.com/soapdog
[@amitzur]:http://github.com/amitzur
[@juliandescottes]:http://github.com/juliandescottes
[@Garbee]:http://github.com/Garbee
[@zystvan]:http://github.com/zystvan
[@najamkhn]:http://github.com/najamkhn
[@jcreighton]:http://github.com/jcreighton
[@jbhoosreddy]:http://github.com/jbhoosreddy
[@tromey]:http://github.com/tromey
[@ryanjduffy]:http://github.com/ryanjduffy
[@sole]:http://github.com/sole
[@lasfin]:http://github.com/lasfin
