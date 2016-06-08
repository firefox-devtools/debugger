# Contributing to debugger.html

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

We respect your time and want to help you make the most of it as you check out this project.

#### Table Of Contents

[What should I know before I get started?](#what-should-i-know-before-i-get-started)
  * [DevTools.html](#devtools.html)
  * [Firefox DevTools Project](#firefox-devtools-project)

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Suggesting Enhancements](#suggesting-enhancements)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Pull Requests](#pull-requests)
  * [Tests](#tests)

[Styleguides](#styleguides)
  * [JavaScript Styleguide](#javascript-styleguide)
  * [CSS Styleguide](#css-styleguide)

## What should I know before I get started?

:warning: The work here is experimental in nature, therefore if you'd like to contribute we are excited to have you as long as you understand it will be hard to keep up as we work through new concepts which may quickly make contributions more difficult than usual.

### DevTools.html

This debugger project is part of a larger initiative called _devtools.html_.  The devtools.html project claims its origin from a demo for a Mozilla (Dec 2016) work week in Orlando, FL USA.  The code for that demo can be found on Github under [@joewalker/devtools.html](https://github.com/joewalker/devtools.html) where the team worked under a tight deadline to provide a proof of concept of the Firefox developer tools running in pure HTML; even outside of Firefox.

From the original demo the devtools.html project has progressed quite a bit.  To learn more about it please read the [devtools.html proposal document](https://docs.google.com/document/d/1_5aerWTN_GVofr6YQVjmJlaGfZ4nv5YKZmdGHewfTpE/edit#heading=h.dw3amfbdp0lh) and take a look at the [devtools.html meta bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1263750) for tracking progress.

### Firefox DevTools Project

While the medium to long term goal of this project is to land within Firefox.  If you're looking to work directly on the DevTools project which ships developer tools for Firefox and Firefox Developer Edition you can find more information on the Mozilla wiki [DevTools / Get Involved](https://wiki.mozilla.org/DevTools/GetInvolved).


## How Can I Contribute?

### Reporting Bugs :bug:

Because of our unstable nature at this point bug fixing is not a top priority for the team.  If you find an issue with the code please do [file an issue](https://github.com/jlongster/debugger.html/issues/new).  We'll do our best to review the issue but a fix may be coming with future changes and so the issue may be closed out to wait until a future fix comes along.

### Suggesting Enhancements :new:

Because of the experimental nature of this project we're not able to review all enhancement suggestions at this point.  However if you have a suggestion you feel is important for the team to be aware of please create an issue, tag it with the [enhancement](https://github.com/jlongster/debugger.html/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement) label and we will attempt to respond.

### Your First Code Contribution

Still interested in contributing even though this is a fast moving experiment?  Unsure where to begin contributing? You can start by looking through the `Beginner Bug` issues:

* [Beginner Bug](https://github.com/jlongster/debugger.html/issues?q=is%3Aissue+is%3Aopen+label%3A%22Beginner+Bug%22) - issues which should only require a few lines of code, and a test or two.

To begin your work make sure you follow these steps:

* [Fork this project](https://github.com/jlongster/debugger.html#fork-destination-box)
* Create a branch to start your work `git checkout -b feature-branch`
* Commit your work
* Create a pull request

### Pull Requests

* Include screenshots and animated GIFs in your pull request whenever possible.
* List any steps necessary to trigger the feature you've created or bug you are fixing
* Always run the tests locally before creating your PR
* Request review from @jasonLaster or @jlongster by mentioning their names in the PR

### Tests

Your code must pass tests to be merged in.  Your tests should pass locally before you create a PR and the CI should run an automated test that also passes.

To test your changes run the command:

```
$ npm run test
```


## Styleguides

### JavaScript Styleguide

We use [eslint](http://eslint.org/) to maintain our JavaScript styles.  The [.eslintrc](https://github.com/jlongster/debugger.html/blob/master/.eslintrc) file contains our style definitions, please adhere to those styles when making changes.

To test your changes against the linter run the command:

```
$ npm run lint-js
```

### CSS Styleguide

We use [Stylelint](http://stylelint.io/) to maintain our CSS styles.  The [.stylelintrc](https://github.com/jlongster/debugger.html/blob/master/.stylelintrc) file contains the style definitions, please adhere to those styles when making changes.

To test your changes against the linter run the command:

```
$ npm run lint-css
```
