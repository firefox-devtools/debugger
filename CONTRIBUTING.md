# Contributing to debugger.html

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

We respect your time and want to help you make the most of it as you learn more about this project.

#### Table Of Contents

[Getting Started](#getting-started)

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs-bug)
  * [Suggesting Enhancements](#suggesting-enhancements-new)
  * [Writing Documentation](#writing-documentation-book)
  * [Share what you know](#share-what-you-know)
  * [Writing Code](#writing-code-computer)
    * [Your First Code Contribution](#your-first-code-contribution)
    * [Coding Standards](#coding-standards)
    * [Pull Requests](#pull-requests)
    * [Local Development](#local-development-computer)
  * [Issues and Pull Request labels](#issues-and-pull-requests)
  * [Project Overview](#project-overview)
    * [debugger.html](#debuggerhtml)
    * [devtools.html](#devtoolshtml)
    * [Firefox Developer Tools](#firefox-developer-tools)

## Getting Started

The developer tools in most major browsers are just web applications.  They are HTML & JS rendered by the browser and talk to the browser itself through an API that gives access to the page internals.  This project is a brand new web application interface for JavaScript debugging designed for browsers and JS environments.

We strive for collaboration with [mutual respect for each other](./CODE_OF_CONDUCT.md).   Mozilla also has a set of [participation guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) which goes into greater detail specific to Mozilla employees and contributors.

[Getting Started][getting-setup]

## How Can I Contribute?

Here is a great GitHub guide on [contributing to Open Source](https://guides.github.com/activities/contributing-to-open-source/) to help you get started.

### Reporting Bugs :bug:

If you find an issue with the code, please do [file an issue](https://github.com/devtools-html/debugger.html/issues/new).  We'll do our best to review the issue in a timely manner and respond.

We will also tag it with the label [bug](https://github.com/devtools-html/debugger.html/labels/bug).

### Suggesting Enhancements :new:

We are actively investigating ways of support enhancement requests in the project, so these instructions are subject to change. For now please create an issue, and we will attempt to respond.

We will also tag it with the label [enhancement][labels-enhancement].

### Writing Documentation :book:

Documentation is as important as code and we need your help to maintain clear and usable documentation.  If you find an error in here or other project documentation, please [file an issue](https://github.com/devtools-html/debugger.html/issues/new).

We will tag it with the label [docs](https://github.com/devtools-html/debugger.html/labels/docs).

### Share what you know

Give a talk or write a blog post and help others get started. Very few developers know that the debugger is a web app. It's a lot of fun to hear the amazing tools others want to build once they learn that they can!

We'd be happy to link to it here. It could go a long way towards helping a newcomer get started!


### Writing Code :computer:

We have a number of tools to help you with your code contributions, the following describes them all and how you can make use of them.

If you've contributed to an open source project before and would like to help this one please take a look through the `up for grabs` issues:

* [up for grabs][labels-up-for-grabs] - issues should have clear requirements and a difficulty level set as a label

If you find an `up for grabs` issue without a difficulty level set as a label or unclear requirements please comment in the issue so we can get that fixed.

#### Your First Code Contribution

If you're looking for a good issue, you can look through the `up-for-grabs` issues. These issues should be actionable and well documented.

There are several difficulty levels, *easy*, *medium*, *hard*. We recommend grabbing an *easy* issue, but it's up to you.

* [up-for-grabs][labels-up-for-grabs] - issues that are not assigned to anyone and are available to be worked on.
* [difficulty:easy][labels-difficulty-easy] - clear expectations and a mentor to help you through.
* [difficulty:medium][labels-difficulty-medium] - more complex and may not have as clear expectations.
* [difficulty:hard][labels-difficulty-hard] - complex and has some open technical questions.

To begin your work make sure you follow these steps:

* [Fork this project](https://github.com/devtools-html/debugger.html#fork-destination-box)
* Create a branch to start your work `git checkout -b your-feature-name`
* Commit your work
* Create a [pull request](#pull-requests)

#### Coding Standards

> Be consistent with the rest of the code in the file

Here are pointers to the DevTools general coding style and formatting guidelines.

* [JS Coding Style](https://wiki.mozilla.org/DevTools/CodingStandards#Code_style)
* [Formatting Comments](https://wiki.mozilla.org/DevTools/CodingStandards#Comments)

#### Issues

We use issues and milestones for planning purposes as well as tracking bugs.

**Keep Issues Relevant**

We try to keep the number of open issues to a minimum.  If work isn't going to be done in a timely manner we would rather close the issue than let them go stale.  Closed issues can always be reopened again when we are ready to start the work.  This process helps keep the focus of the project more understandable to others.

**Intent to implement**

When a person is assigned to an issue this indicates an _intent to implement_.  Please ask within the issue if you would like to work on a fix so multiple people don't create pull requests for it.

#### Pull Requests

Go to [Pull Requests](./docs/pull-requests.md) to learn about:

* [Screenshots](./docs/pull-requests.md#screenshots)
* [Test Steps](./docs/pull-requests.md#test-steps)
* [Testing](./docs/pull-requests.md#testing)
* [Reviews](./docs/pull-requests.md#reviews)
* [Updates](./docs/pull-requests.md#updates)

> **Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

### Local Development :computer:

Go to [local Development](./docs/local-development.md) to learn about:

* [Configs](./docs/local-development.md#configs)
* [Hot Reloading](./docs/local-development.md#hot-reloading)
* [Themes](./docs/local-development.md#themes)
* [Internationalization](./docs/local-development.md#internationalization)
* [Prefs](./docs/local-development.md#prefs)
* [Flow](./docs/local-development.md#flow)
* [Logging](./docs/local-development.md#logging)
* [Testing](./docs/local-development.md#testing)
* [Linting](./docs/local-development.md#linting)


## Issues and Pull Request labels

These are the [labels](https://github.com/devtools-html/debugger.html/labels) we use to help organize and communicate the state of issues and pull requests in the project.  If you find a label being used that isn't described here please file an issue to get it listed.

| Label name | query:mag_right: | Description |
| --- | --- | --- |
| `up-for-grabs` | [search][labels-up-for-grabs] | Good for contributors to work on |
| `difficulty:easy` | [search][labels-difficulty-easy] | Work that is small changes, updating tests, updating docs, expect very little review |
| `difficulty:medium` | [search][labels-difficulty-medium] | Work that adapts existing code, adapts existing tests, expect quick review |
| `difficulty:hard` | [search][labels-difficulty-hard] | Work that requires new tests, new code, and a good understanding of project; expect lots of review |
| `docs` | [search][labels-docs] | Issues with our documentation |
| `design` | [search][labels-design] | Issues that require design work |
| `enhancement` | [search][labels-enhancement] | [Requests](#suggesting-enhancements-new) for features |
| `bug` | [search][labels-bug] | [Reported Bugs](#reporting-bugs-bug) with the current code |
| `chrome` | [search][labels-chrome] | Chrome only issues |
| `firefox` | [search][labels-firefox] | Firefox only issues |
| `infrastructure` | [search][labels-infrastructure] | Issues with testing / build infrastructure |
| `not actionable` | [search][labels-not-actionable] | Issues need clearer requirements before work can be started |

[labels-up-for-grabs]:https://github.com/devtools-html/debugger.html/labels/up%20for%20grabs
[labels-first-timers-only]:https://github.com/devtools-html/debugger.html/labels/first-timers-only
[labels-difficulty-easy]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%20easy
[labels-difficulty-medium]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%medium
[labels-difficulty-hard]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%hard
[labels-docs]:https://github.com/devtools-html/debugger.html/labels/docs
[labels-design]:https://github.com/devtools-html/debugger.html/labels/design
[labels-enhancement]:https://github.com/devtools-html/debugger.html/labels/enhancement
[labels-bug]:https://github.com/devtools-html/debugger.html/labels/bug
[labels-chrome]:https://github.com/devtools-html/debugger.html/labels/chrome
[labels-firefox]:https://github.com/devtools-html/debugger.html/labels/firefox
[labels-infrastructure]:https://github.com/devtools-html/debugger.html/labels/infrastructure
[labels-not-actionable]:https://github.com/devtools-html/debugger.html/labels/not%20actionable

[GitHub Desktop]:https://desktop.github.com/

## Project Overview

### debugger.html

The debugger.html project is a JavaScript debugger built from the ground up using modern web application technologies.  It is designed first for debugging Firefox but also for working with projects like Chrome and Node.  The name debugger.html was chosen because this debugger interface is being written using modern web technologies where as the previous Firefox debugger was written in [XUL](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL).

### devtools.html

devtools.html is the larger umbrella initiative that encompasses the debugger.html and several other devtools projects.  The devtools.html project claims its origin from a demo for a Mozilla (Dec 2015) work week in Orlando, FL USA where the team worked under a tight deadline to provide a proof of concept of the Firefox developer tools running in pure HTML; even outside of Firefox. The code for that demo can be found on GitHub under [@joewalker/devtools.html](https://github.com/joewalker/devtools.html).

From that original demo the devtools.html project has progressed quite a bit.  To learn more about it please read the [devtools.html proposal document](https://docs.google.com/document/d/1_5aerWTN_GVofr6YQVjmJlaGfZ4nv5YKZmdGHewfTpE/edit#heading=h.dw3amfbdp0lh) and take a look at the [devtools.html meta bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1263750) for tracking progress.

### Firefox Developer Tools

The debugger.html project is targeted to land in Firefox for Firefox 52.  However if you're looking to work directly on the DevTools project which ships developer tools for Firefox and Firefox Developer Edition right now you can find more information on the Mozilla wiki [DevTools / Get Involved](https://wiki.mozilla.org/DevTools/GetInvolved).


[getting-setup]:./docs/getting-setup.md
