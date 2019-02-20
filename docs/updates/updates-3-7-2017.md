### March 7th

We released the new Debugger this week! We also added lots of polish to the UI to improve the look and feel.

Thanks to everyone who helped make the release possible and chipped in on last minute polish
[@wldcordeiro], [@julienw], [@ThomasCrevoisier], [@amitzur], [@jcreighton], [@zystvan], [@juliandescottes], [@tromey], [@AlanCezarAraujo], [@irfanhudda], [@rrandom]

#### UI

We focused mostly on dark theme, vertical mode, and the new search bar and preview.
Special shoutout to [@amitzur] who landed a great editor popup for previewing variables.

* [Fix border stacking for the result list in function search.][pr-2] - [@wldcordeiro]
* [Fix close button display for watch expression][pr-6] - [@ThomasCrevoisier]
* [Polish dark theme ui][pr-9] - [@jcreighton]
* [Fix Tab Dropdown in RTL Mode][pr-10] - [@zystvan]
* [Polish overlay clearing][pr-13] - [@wldcordeiro]
* [Add variables.css to debugger.html and remove references to undefined css var][pr-15] - [@juliandescottes]
* [Change the breakpoint used to switch between horizontal and vertical …][pr-16] - [@julienw]
* [Fixed max-height in Result List][pr-19] - [@AlanCezarAraujo]
* [Quote property names when required][pr-17] - [@tromey]
* [Center tab close button and increase its size][pr-21] - [@irfanhudda]
* [Popover tip and position][pr-8] - [@amitzur]

#### Function Search

Function search took a big jump this week. It now supports searching for ES6 shorthand functions, class methods, and a whole assortment of function types making it the best function search available. Expect more wins in this department as babel is really great for this kind of work.

* [Add parsing support for ES6 object method shorthand and class methods.][pr-1] - [@wldcordeiro]
* [Function Search wins][pr-7] - [@jasonLaster]
* [Rework function parser helpers into symbol parser helpers that parse functions, variables, and classes][pr-18] - [@wldcordeiro]

#### Bugs

We're continuing to fix the embarrassing bugs. This pause on exception bug was a long standing bug where the pause button would stay highlighted when the debugger opened even if the debugger was not going to pause on exceptions.

* [Persist Pause On Exceptions][pr-0] - [@jasonLaster]

#### Infrastructure

The most frustrating aspect of last week was integrating with mozilla-central and getting the tests to
pass consistently on different platforms in debug mode. We disabled `visible` checks and the new web test runner tests, which were causing some intermittents.

* [Extract getScopes + Refactor returnvalue tests][pr-3] - [@jasonLaster]
* [Enable features + style tweaks][pr-4] - [@jasonLaster]
* [Fix the copy-assets script to support an absolute path to m-c, and su…][pr-5] - [@julienw]
* [disable all new debugger tests on debug platforms][pr-12] - [@juliandescottes]
* [revert wtr conversion][pr-14] - [@jasonLaster]
* [Fix linting table][pr-20] - [@wldcordeiro]
* [Remove unused expressions field][pr-22] - [@jasonLaster]
* [remove isVisible checks][pr-23] - [@jasonLaster]
* [Hardcoded string to constant in actions/sources][pr-24] - [@rrandom]



|Preview Popup|
|----------------|
|![gif-1]|

|Dark Theme Updates|
|----|
|![png-1]|
|![png-2]|


#### ES6 Shorthand & Class Methods
```js

// ES6 shorthand
const TodoView = Backbone.View.extend({
  doThing() {
    console.log('hi');
  },
});

// classes
class Test {
  constructor() {
    this.foo = "foo"
  }
}
```


[gif-1]:https://cloud.githubusercontent.com/assets/394320/23443190/c2a9ada6-fe35-11e6-9b01-563ec6e335f3.gif
[png-1]:https://cloud.githubusercontent.com/assets/5232812/23445290/5e6314ae-fe08-11e6-8a21-e6875881ecc4.png
[png-2]:https://cloud.githubusercontent.com/assets/5232812/23445256/3266940c-fe08-11e6-8b55-e2cf293838f7.png

[pr-0]:https://github.com/firefox-devtools/debugger/pull/2225
[pr-1]:https://github.com/firefox-devtools/debugger/pull/2236
[pr-2]:https://github.com/firefox-devtools/debugger/pull/2223
[pr-3]:https://github.com/firefox-devtools/debugger/pull/2217
[pr-4]:https://github.com/firefox-devtools/debugger/pull/2243
[pr-5]:https://github.com/firefox-devtools/debugger/pull/2244
[pr-6]:https://github.com/firefox-devtools/debugger/pull/2237
[pr-7]:https://github.com/firefox-devtools/debugger/pull/2234
[pr-8]:https://github.com/firefox-devtools/debugger/pull/2224
[pr-9]:https://github.com/firefox-devtools/debugger/pull/2229
[pr-10]:https://github.com/firefox-devtools/debugger/pull/2222
[pr-11]:https://github.com/firefox-devtools/debugger/pull/2261
[pr-12]:https://github.com/firefox-devtools/debugger/pull/2254
[pr-13]:https://github.com/firefox-devtools/debugger/pull/2252
[pr-14]:https://github.com/firefox-devtools/debugger/pull/2259
[pr-15]:https://github.com/firefox-devtools/debugger/pull/2253
[pr-16]:https://github.com/firefox-devtools/debugger/pull/2245
[pr-17]:https://github.com/firefox-devtools/debugger/pull/2255
[pr-18]:https://github.com/firefox-devtools/debugger/pull/2250
[pr-19]:https://github.com/firefox-devtools/debugger/pull/2270
[pr-20]:https://github.com/firefox-devtools/debugger/pull/2273
[pr-21]:https://github.com/firefox-devtools/debugger/pull/2272
[pr-22]:https://github.com/firefox-devtools/debugger/pull/2275
[pr-23]:https://github.com/firefox-devtools/debugger/pull/2276
[pr-24]:https://github.com/firefox-devtools/debugger/pull/2286
[@jasonLaster]:http://github.com/jasonLaster
[@wldcordeiro]:http://github.com/wldcordeiro
[@julienw]:http://github.com/julienw
[@ThomasCrevoisier]:http://github.com/ThomasCrevoisier
[@amitzur]:http://github.com/amitzur
[@jcreighton]:http://github.com/jcreighton
[@zystvan]:http://github.com/zystvan
[@juliandescottes]:http://github.com/juliandescottes
[@tromey]:http://github.com/tromey
[@AlanCezarAraujo]:http://github.com/AlanCezarAraujo
[@irfanhudda]:http://github.com/irfanhudda
[@rrandom]:http://github.com/rrandom
